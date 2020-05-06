package flow

import (
	"encoding/json"
	"log"

	"github.com/kidoman/embd"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.FlowBucket
const UsageBucket = storage.FlowUsageBucket

type Config struct {
	DevMode bool `json:"dev_mode"`
}
type Controller struct {
	config     Config
	c          controller.Controller
	inlets     *connectors.Inlets
	pins       map[string]*embd.DigitalPin
	devMode    bool
	quitters   map[string]chan struct{}
	statsMgr   telemetry.StatsManager
	fcs        map[string]*FC
	pulses     map[string]chan interface{}
	lastpulses map[string]uint64
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	return &Controller{
		c:          c,
		inlets:     c.DM().Inlets(),
		devMode:    devMode,
		pins:       make(map[string]*embd.DigitalPin),
		quitters:   make(map[string]chan struct{}),
		pulses:     make(map[string]chan interface{}),
		fcs:        make(map[string]*FC),
		lastpulses: make(map[string]uint64),
		statsMgr:   c.Telemetry().NewStatsManager(UsageBucket),
	}, nil
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.c.Store().CreateBucket(UsageBucket); err != nil {
		return err
	}
	fcs, err := c.List()
	if err != nil {
		return err
	}
	for i, tc := range fcs {
		c.fcs[tc.ID] = &fcs[i]
	}
	return nil
}

func (c *Controller) Start() {
	if !c.config.DevMode {
		embd.InitGPIO()
	}
	for _, f := range c.fcs {
		if !f.Enable {
			continue
		}
		fn := func(d json.RawMessage) interface{} {
			var u controller.Observation
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(f.ID, fn); err != nil {
			log.Println("ERROR: flow subsystem. Failed to load usage. Error:", err)
		}
		quit := make(chan struct{})
		c.quitters[f.ID] = quit
		pulse := make(chan interface{})
		c.pulses[f.ID] = pulse
		c.preparePin(f.ID, f)
		go c.Run(f, quit)
	}
}
func (c *Controller) Stop() {
	for id, quit := range c.quitters {
		close(quit)
		pulse := c.pulses[id]
		close(pulse)
		c.releasePin(id)
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: flow controller. Failed to save usage. Error:", err)
		}
		log.Println("flow sub-system: Saved usage data of sensor:", id)
		delete(c.quitters, id)
		delete(c.pulses, id)
		delete(c.pins, id)
	}
}

func (c *Controller) On(id string, on bool) error {
	tc, err := c.Get(id)
	if err != nil {
		return err
	}
	tc.SetEnable(on)
	return c.Update(id, tc)
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	return deps, nil
}
