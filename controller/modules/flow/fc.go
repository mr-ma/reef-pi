package flow

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/kidoman/embd"
	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Notify struct {
	Enable bool    `json:"enable"`
	Count  float64 `json:"count"`
}

type FC struct {
	sync.Mutex
	ID                string            `json:"id"`
	Name              string            `json:"name"`
	Rate              float64           `json:"rate"`
	Unit              string            `json:"unit"`
	Period            time.Duration     `json:"period"`
	FlowCount         float64           `json:"flow_count"`
	MaxCount          float64           `json:"max_count"`
	Enable            bool              `json:"enable"`
	Notify            Notify            `json:"notify"`
	Pin               string            `json:"pin"`
	CalibrationPoints []hal.Measurement `json:"calibration_points"`
	PulseCount        uint64            `json:"pulse_count"`
	calibrator        hal.Calibrator
}

func (c *Controller) Get(id string) (*FC, error) {
	fc, ok := c.fcs[id]
	if !ok {
		return nil, fmt.Errorf("flow controller with id '%s' is not present", fc.ID)
	}
	return fc, nil
}

func (c Controller) List() ([]FC, error) {
	fcs := []FC{}
	fn := func(_ string, v []byte) error {
		var fc FC
		if err := json.Unmarshal(v, &fc); err != nil {
			return err
		}
		fcs = append(fcs, fc)
		return nil
	}

	// demofc := FC{
	// Enable: true, Name: "demo1", pulseCount: 0, ID: "1",
	// Period: 1, MaxCount: 0, Pin: "17", Rate: 60 * 7.5}
	// fcs = append(fcs, demofc)
	return fcs, c.c.Store().List(Bucket, fn)
}

func (fc *FC) loadCalibrator() {
	if len(fc.CalibrationPoints) > 0 {
		cal, err := hal.CalibratorFactory(fc.CalibrationPoints)
		if err != nil {
			log.Println("ERROR: flow-subsystem: Failed to create calibration function for sensor:", fc.Name, "Error:", err)
		} else {
			fc.calibrator = cal
		}
	}
}

func (c *Controller) Create(fc FC) error {
	if fc.Period <= 0 {
		return fmt.Errorf("Check period for flow controller must be greater than zero")
	}
	fn := func(id string) interface{} {
		fc.ID = id
		return &fc
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
	fc.loadCalibrator()
	c.fcs[fc.ID] = &fc
	c.statsMgr.Initialize(fc.ID)
	if fc.Enable {
		pulse := make(chan interface{})
		quit := make(chan struct{})
		c.pulses[fc.ID] = pulse
		c.quitters[fc.ID] = quit
		c.preparePin(fc.ID, &fc)
		go c.Run(&fc, quit)
	}
	return nil
}
func (c *Controller) releasePin(id string) {
	if c.devMode {
		return
	}
	pin, ok := c.pins[id]
	if ok {
		(*pin).StopWatching()
		(*pin).Close()
	}

}
func (c *Controller) preparePin(id string, f *FC) {
	if c.devMode {
		return
	}
	inlet, err := c.inlets.Get(f.Pin)
	if err != nil {
		log.Fatalln("flow subsystem. Failed to find inlet fc")
		panic("Failed to get the inlet of fc")
	}
	inletpin := inlet.Pin
	pin, err := embd.NewDigitalPin(inletpin)
	if err != nil {
		log.Fatalln("flow subsystem. Failed to allocate digital pin")
		panic("flow subsystem. Failed to allocate digital pin")
	}
	pin.SetDirection(embd.In)
	pin.ActiveLow(false)
	c.pins[f.ID] = &pin
}
func (c *Controller) Update(id string, fc *FC) error {
	fc.ID = id
	if fc.Period <= 0 {
		return fmt.Errorf("Period should be positive. Supplied:%d", fc.Period)
	}
	if err := c.c.Store().Update(Bucket, id, fc); err != nil {
		return err
	}

	c.releasePin(fc.ID)

	quit, ok := c.quitters[fc.ID]
	if ok {
		close(quit)
		delete(c.quitters, fc.ID)
	}
	pulse, ok := c.pulses[fc.ID]
	if ok {
		close(pulse)
		delete(c.pulses, fc.ID)
	}
	fc.loadCalibrator()
	c.fcs[fc.ID] = fc
	if fc.Enable {
		quit := make(chan struct{})
		pulse := make(chan interface{})
		c.quitters[fc.ID] = quit
		c.pulses[fc.ID] = pulse
		c.preparePin(id, fc)
		go c.Run(fc, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.c.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if err := c.c.Store().Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  flow sub-system: Failed to delete usage details for sensor:", id)
	}
	c.releasePin(id)
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	pulse, ok := c.pulses[id]
	if ok {
		close(pulse)
		delete(c.pulses, id)
	}
	delete(c.fcs, id)
	return nil
}

func (c *Controller) Run(f *FC, quit chan struct{}) {
	f.CreateFeed(c.c.Telemetry())
	log.Println("flow sub-system. Start Running with ticks of ", f.Period*time.Second)
	if f.Period <= 0 {
		log.Printf(`ERROR: flow sub-system. Invalid period set for sensor:%s. 
		Expected positive, found:%d\n`, f.Name, f.Period)
		return
	}
	ticker := time.NewTicker(f.Period * time.Second)
	pulse, ok := c.pulses[f.ID]
	if !ok {
		log.Fatalln("flow subsystem. Failed to find pulse channel for fc")
		panic("No pulse channel found for the flow sensor")
	}
	pin, ok := c.pins[f.ID]
	if !ok && !c.devMode {
		log.Fatalln("flow subsystem. Failed to find digitalPin")
		panic("Failed to find digitalPin")
	}

	go f.Listen(c.devMode, pin, pulse, quit)
	for {
		select {
		case <-ticker.C:
			c.Check(f)
		case <-quit:
			log.Println("flow sub-system Quitting Run")
			ticker.Stop()
			return
		}
	}
}

func (fc *FC) SetEnable(b bool) {
	fc.Lock()
	defer fc.Unlock()
	fc.Enable = b
}

func (fc *FC) CreateFeed(telemetry telemetry.Telemetry) {
	fc.Lock()
	defer fc.Unlock()
	if !fc.Enable {
		return
	}
	telemetry.CreateFeedIfNotExist(fc.Name + "-reading")
}
