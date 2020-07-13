package leak

import (
	"encoding/json"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.LeakBucket

type Notify struct {
	Enable bool    `json:"enable"`
	Max    float64 `json:"max"`
}
type SensorStatus struct {
	Status int       `json:"status"`
	Date   time.Time `json:"date"`
}
type Leak struct {
	ID                         string         `json:"id"`
	Name                       string         `json:"name"`
	EndpointID                 string         `json:"endpoint_id"`
	Enable                     bool           `json:"enable"`
	ExpectedHeartbeatFrequency int            `json:"expected_heartbeat_frequency"`
	Period                     time.Duration  `json:"period"`
	OnStatusZeroMacro          string         `json:"on_status_zero_macro"`
	OnStatusOneMacro           string         `json:"on_status_one_macro"`
	LastHeartbeat              time.Time      `json:"last_heartbeat"`
	States                     []SensorStatus `json:"states"`
	Notify                     Notify         `json:"notify"`
	DisableOnAlert             bool           `json:"disable_on_alert"`
}

func (c *Controller) Get(id string) (Leak, error) {
	var eq Leak
	return eq, c.store.Get(Bucket, id, &eq)
}

func (c Controller) List() ([]Leak, error) {
	es := []Leak{}
	fn := func(_ string, v []byte) error {
		var eq Leak
		if err := json.Unmarshal(v, &eq); err != nil {
			return err
		}
		es = append(es, eq)
		return nil
	}
	return es, c.store.List(Bucket, fn)
}

func (c *Controller) Create(lk Leak) error {
	fn := func(id string) interface{} {
		lk.ID = id
		return &lk
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	c.lks[lk.ID] = &lk
	if lk.Enable {
		quit := make(chan struct{})
		c.quitters[lk.ID] = quit
		go c.Run(&lk, quit)
	}
	return nil
}

func (c *Controller) Update(id string, lk Leak) error {
	lk.ID = id
	if err := c.store.Update(Bucket, id, lk); err != nil {
		return err
	}
	quit, ok := c.quitters[lk.ID]
	if ok {
		close(quit)
		delete(c.quitters, lk.ID)
	}
	c.lks[lk.ID] = &lk
	if lk.Enable {
		quit := make(chan struct{})
		c.quitters[lk.ID] = quit
		go c.Run(&lk, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	err = c.store.Delete(Bucket, id)
	if err != nil {
		log.Println("ERROR: leak sub-system. Failed to delete leak sensor")
	} else {
		c.Lock()
		defer c.Unlock()
		quit, ok := c.quitters[id]
		if ok {
			close(quit)
			delete(c.quitters, id)
		}
		delete(c.lks, id)
	}
	return err

}

func (c *Controller) Run(l *Leak, quit chan struct{}) {
	if l.Period <= 0 {
		log.Printf("ERROR: leak sub-system. Invalid period set for sensor:%s. Expected positive, found:%d\n", l.Name, l.Period)
		return
	}
	ticker := time.NewTicker(l.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			c.Check(l)
		case <-quit:
			ticker.Stop()
			return
		}
	}
}
