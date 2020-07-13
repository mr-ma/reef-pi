package leak

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const CapLeakStates = 100

type Controller struct {
	sync.Mutex
	telemetry telemetry.Telemetry
	store     storage.Store
	macro     controller.Subsystem
	c         controller.Controller
	quitters  map[string]chan struct{}
	lks       map[string]*Leak
}

func New(c controller.Controller) *Controller {
	return &Controller{
		telemetry: c.Telemetry(),
		store:     c.Store(),
		lks:       make(map[string]*Leak),
		quitters:  make(map[string]chan struct{}),
		c:         c,
	}
}
func (c *Controller) On(id string, on bool) error {
	j, err := c.Get(id)
	if err != nil {
		return err
	}
	j.Enable = on
	return c.Update(id, j)
}
func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}

	if m, err := c.c.Subsystem(storage.MacroBucket); err == nil {
		c.macro = m
	}
	lks, err := c.List()
	if err != nil {
		return err
	}
	for i, lk := range lks {
		c.lks[lk.ID] = &lks[i]
	}
	return nil
}

func (c *Controller) HandleStatusReport(lk Leak, status SensorStatus) {

	//add the last state report to the leak sensor
	//and drop old reads when the cap is reached
	c.Lock()
	defer c.Unlock()
	all := len(lk.States)
	lk.States = append(lk.States, status)
	if all+1 > CapLeakStates {
		lk.States = lk.States[all+1-CapLeakStates:]
	}
	lk.LastHeartbeat = status.Date
	c.Update(lk.ID, lk)

	if c.macro == nil {
		log.Println("ERROR: leak-subsystem: macro subsystem is nil; cannot handle status reports with no macro subsystem")
		return
	}
	triggerMacro := ""
	if status.Status == 0 {
		//run on status zero macro
		if lk.OnStatusZeroMacro != "" {
			triggerMacro = lk.OnStatusZeroMacro
			log.Println("INFO: leak-subsystem: status report 0 received; OnStatusZeroMacro will be triggered")
		}
	} else if status.Status == 1 {
		//run on status one macro
		if lk.OnStatusOneMacro != "" {
			triggerMacro = lk.OnStatusOneMacro
			log.Println("INFO: leak-subsystem: status report 1 received; OnStatusOneMacro will be triggered")
		}
	} else {
		//log the status error
		log.Println("ERROR. leak-subsystem: status report indicates an status value other than 0 or 1; value is:", status.Status)
	}
	if triggerMacro != "" {
		if err := c.macro.On(triggerMacro, false); err != nil {
			log.Println("ERROR: leak sub-system, Failed to trigger macro. Error:", err)
		}
	}
}

func (c *Controller) Start() {
	c.Lock()
	defer c.Unlock()
	for _, l := range c.lks {
		if !l.Enable {
			continue
		}
		quit := make(chan struct{})
		c.quitters[l.ID] = quit
		go c.Run(l, quit)
	}
}

func (c *Controller) Stop() {
	c.Lock()
	defer c.Unlock()
	for id, quit := range c.quitters {
		close(quit)
		delete(c.quitters, id)
	}
}
func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	return deps, nil
}

func (c *Controller) Check(lk *Leak) {
	if !lk.Enable {
		return
	}
	if lk.ExpectedHeartbeatFrequency <= 0 {
		//we do not need to check for heartbeat
		return
	}

	if lk.LastHeartbeat.IsZero() {
		//so far no hearbeat
	}

	diff := time.Since(lk.LastHeartbeat)
	inf := fmt.Sprintf("checking heartbeat %s, expected heartbeat frequency:%d, seconds since last heartbeat: %f",
		lk.LastHeartbeat.String(), lk.ExpectedHeartbeatFrequency,
		diff.Seconds())
	log.Println("INFO. Leak sub-system:" + inf)
	c.c.Telemetry().EmitMetric(lk.Name,
		inf, diff.Seconds())
	if diff.Seconds() > float64(lk.ExpectedHeartbeatFrequency) {
		c.NotifyIfNeeded(*lk, diff.Seconds())
	}
}
func (c *Controller) NotifyIfNeeded(lk Leak, diff float64) {
	if !lk.Notify.Enable {
		return
	}
	subject := fmt.Sprintf("[Reef-Pi ALERT] heartbeat report of '%s' has not been received", lk.Name)
	format := "Last heartbeat (%s) since then no heartbeats for (%f) seconds; max tolerance of delay of heartbeat is set to %f"
	body := fmt.Sprintf(format, lk.LastHeartbeat.String(), diff, lk.Notify.Max)
	if diff >= lk.Notify.Max {
		c.c.Telemetry().Alert(subject, "Leak detection is not sending heartbeat."+body)
		return
	}
}
