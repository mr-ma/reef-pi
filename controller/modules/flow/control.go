package flow

import (
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func (c *Controller) Check(fc *FC) {
	currentPulseCount := fc.PulseCount
	lastPulseCount, ok := c.lastpulses[fc.ID]
	if ok && currentPulseCount == lastPulseCount {
		// log.Println("sensor flow same pulse value, skipping check calculations")
		return
	}
	c.lastpulses[fc.ID] = currentPulseCount
	log.Println("flow sub-system:  sensor ", fc.Name,
		" lastValue:", lastPulseCount,
		" currentValue:", currentPulseCount, " enabled ", fc.Enable)
	if !fc.Enable {
		return
	}

	c.c.Telemetry().EmitMetric(fc.Name, "reading", float64(currentPulseCount))
	fc.Lock()
	fc.FlowCount = float64(currentPulseCount) / fc.Rate
	if err := c.c.Store().Update(Bucket, fc.ID, fc); err != nil {
		log.Fatalln(err.Error())
	}
	fc.Unlock()
	u := controller.Observation{
		Time:  telemetry.TeleTime(time.Now()),
		Value: fc.FlowCount,
	}
	c.NotifyIfNeeded(*fc, fc.FlowCount)
	c.statsMgr.Update(fc.ID, u)
}

func (c *Controller) NotifyIfNeeded(fc FC, count float64) {
	if !fc.Notify.Enable {
		return
	}
	subject := fmt.Sprintf("[Reef-Pi ALERT] flow of '%s' out of range", fc.Name)
	format := "Current flow count (%f) is out of acceptable range ( %f )"
	body := fmt.Sprintf(format, count, fc.Notify.Count)
	if fc.FlowCount >= fc.Notify.Count {
		c.c.Telemetry().Alert(subject, "Flow sensor has reached the specified count cap."+body)
		return
	}
}
