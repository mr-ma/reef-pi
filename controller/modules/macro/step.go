package macro

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/modules/doser"
	"github.com/reef-pi/reef-pi/controller/modules/temperature"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type GenericStep struct {
	ID string `json:"id"`
	On bool   `json:"on"`
}

type WaitStep struct {
	Duration time.Duration `json:"duration"`
}
type WaitTemperatureStep struct {
	ID         string        `json:"id"`
	Frequency  time.Duration `json:"frequency"`
	RangeTemp1 float64       `json:"rangetemp1"`
	RangeTemp2 float64       `json:"rangetemp2"`
}
type DoserStep struct {
	ID       string  `json:"id"`
	Duration float64 `json:"duration"`
	Speed    float64 `json:"speed"`
}
type StepStatus int

const (
	Scheduled StepStatus = iota
	Started
	Finished
)

type Step struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
	Status StepStatus      `json:"status"`
	Start  time.Time       `json:"start"`
	End    time.Time       `json:"end"`
}

func NewStep() *Step {
	p := new(Step)
	p.Status = Scheduled
	return p
}

type TemperatureRead struct {
	Temperature float64 `json:"temperature"`
}

func (s *Step) Run(c controller.Controller, reverse bool) error {
	switch s.Type {
	case "directdoser":
		var dt DoserStep
		if err := json.Unmarshal(s.Config, &dt); err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: DirectDoserStep; Duration:", int(dt.Duration), "second(s) ", dt.Speed, " speed")
		dosersubsystem, _ := c.Subsystem(storage.DoserBucket)
		dc, ok := dosersubsystem.(*doser.Controller)
		if !ok {
			return errors.New("Failed to cast doser subsystem to doser controller")
		}
		dc.DirectStart(dt.ID, dt.Duration, dt.Speed)

		return nil
	case storage.EquipmentBucket, storage.ATOBucket, storage.TemperatureBucket,
		storage.DoserBucket, storage.PhBucket, storage.TimerBucket, storage.MacroBucket, "subsystem":
		var g GenericStep
		if err := json.Unmarshal(s.Config, &g); err != nil {
			return err
		}
		state := g.On
		if reverse {
			state = !state
		}
		if s.Type == "subsystem" {
			sub, err := c.Subsystem(g.ID)
			if err != nil {
				return err
			}
			if state {
				sub.Start()
				return nil
			}
			sub.Stop()
			return nil
		}
		sub, err := c.Subsystem(s.Type)
		if err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: ", s.Type, "id:", g.ID, " state:", state)
		return sub.On(g.ID, state)
	case "wait":
		var w WaitStep
		if err := json.Unmarshal(s.Config, &w); err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: sleep for", int(w.Duration), "seconds")
		time.Sleep(w.Duration * time.Second)
		return nil
	// case "inletwait":
	// 	devInlets := c.DM().Inlets()
	// 	var inletStep GenericStep
	// 	if err := json.Unmarshal(s.Config, &inletStep); err != nil {
	// 		return err
	// 	}
	// 	for value, err := devInlets.Read(inletStep.ID); err != nil && value != 1; {
	// 		return nil
	// 	}
	// 	return nil
	case "waittemp":
		var wt WaitTemperatureStep
		if err := json.Unmarshal(s.Config, &wt); err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: sleep until temperature is reached-- Frequency of checks:", int(wt.Frequency), "seconds", "rangetemp1", wt.RangeTemp1, "rangetemp2", wt.RangeTemp2)
		isInRange := false
		for !isInRange {
			log.Println("macro-subsystem: executing step: assigned temperature sensor ID:", wt.ID)

			tempsubsystem, _ := c.Subsystem(temperature.Bucket)
			tc, ok := tempsubsystem.(*temperature.Controller)
			if !ok {
				log.Println("macro-subsystem: executing step: not able to read the temperature")
				return errors.New("Failed to cast temperature subsystem to temperature controller")
			}
			sensor, err := tc.Get(wt.ID)
			if err != nil {
				log.Println("not able to read the sensor value", err.Error())
				return err
			}
			currentRead, _ := tc.Read(*sensor)

			log.Println("macro-subsystem: executing step: awaiting temperature, current read:", currentRead)
			//if the read is in range
			if currentRead >= wt.RangeTemp1 && currentRead <= wt.RangeTemp2 {
				log.Println("macro-subsystem: executing step: temperature has reached:", currentRead)
				isInRange = true
			} else {
				log.Println("macro-subsystem: executing step: sleeping for ", wt.Frequency*time.Second)
				time.Sleep(wt.Frequency * time.Second)
			}
		}

		return nil
	default:
		return fmt.Errorf("Unknown step type:%s", s.Type)
	}
}
