package doser

import (
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"gobot.io/x/gobot"
	"gobot.io/x/gobot/drivers/gpio"
	"gobot.io/x/gobot/platforms/raspi"
)

type Runner struct {
	deviceManager *device_manager.DeviceManager
	devMode       bool
	pump          *Pump
	jacks         *connectors.Jacks
	statsMgr      telemetry.StatsManager
}

func (runner *Runner) DoseStepper(speed float64, duration float64) {

	//no need to dose in the devMode
	if runner.devMode {
		return
	}
	// Inputs to the DoseStepper stepDelay, seq => arrays of steps,
	// and stepDir; 1 or 2 for clockwise, -1 or -2 for counter-clockwise
	// Check stepDir and seq with manufacturer documentation
	// Start here: https://github.com/hybridgroup/gobot/blob/a8f33b2fc012951104857c485e85b35bf5c4cb9d/drivers/gpio/stepper_driver.go
	r := raspi.NewAdaptor()
	log.Printf("Stepper pins: %s, %s, %s, %s\n",
		runner.pump.In1Pin,
		runner.pump.In2Pin,
		runner.pump.In3Pin,
		runner.pump.In4Pin)
	stepper := gpio.NewStepperDriver(r, [4]string{runner.pump.In1Pin, runner.pump.In2Pin,
		runner.pump.In3Pin,
		runner.pump.In4Pin},
		gpio.StepperModes.DualPhaseStepping, runner.pump.StepsPerRevolution)

	work := func() {
		//set spped
		stepper.SetSpeed(uint(speed))

		//Move forward one revolution
		if err := stepper.Move(int(duration)); err != nil {
			fmt.Println(err)
		}
	}

	robot := gobot.NewRobot("stepperBot",
		[]gobot.Connection{r},
		[]gobot.Device{stepper},
		work,
	)

	robot.Start()
}
func (r *Runner) Dose(speed float64, duration float64) error {
	log.Println("In the DOSE function (speed, duration)", speed, duration)

	if r.pump.IsStepper {
		log.Printf("Stepper mode dosing speed:%v, duration:%v\n", speed, duration)
		//logic for stepper motor dosing
		r.DoseStepper(speed, duration)
	} else {
		v := make(map[int]float64)
		v[r.pump.Pin] = speed
		if err := r.jacks.Control(r.pump.Jack, v); err != nil {
			log.Fatalln(err.Error())
			return err
		}
		select {
		case <-time.After(time.Duration(duration * float64(time.Second))):
			v[r.pump.Pin] = 0
			if err := r.jacks.Control(r.pump.Jack, v); err != nil {
				log.Fatalln(err.Error())
				return err
			}
		}
	}
	return nil
}

func (r *Runner) Run() {
	log.Println("doser sub system: scheduled run ", r.pump.Name)
	if err := r.Dose(r.pump.Regiment.Speed, r.pump.Regiment.Duration); err != nil {
		log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		return
	}
	usage := Usage{
		Time: telemetry.TeleTime(time.Now()),
		Pump: int(r.pump.Regiment.Duration),
	}
	r.statsMgr.Update(r.pump.ID, usage)
	r.statsMgr.Save(r.pump.ID)
	//r.Telemetry().EmitMetric("doser"+r.pump.Name+"-usage", usage.Pump)
}
func (r *Runner) RunDirect(Duration float64, Speed float64) {
	log.Println("doser sub system: scheduled run ", r.pump.Name)
	if err := r.Dose(Speed, Duration); err != nil {
		log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		return
	}
	usage := Usage{
		Time: telemetry.TeleTime(time.Now()),
		Pump: int(Duration),
	}
	r.statsMgr.Update(r.pump.ID, usage)
	r.statsMgr.Save(r.pump.ID)
	//r.Telemetry().EmitMetric("doser"+r.pump.Name+"-usage", usage.Pump)
}
