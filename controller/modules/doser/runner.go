package doser

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Runner struct {
	pump     *Pump
	jacks    *connectors.Jacks
	statsMgr telemetry.StatsManager
}

func (r *Runner) Dose(speed float64, duration float64) error {
	log.Println("In the DOSE function (speed, duration)", speed, duration)
	v := make(map[int]float64)
	v[r.pump.Pin] = speed
	if err := r.jacks.Control(r.pump.Jack, v); err != nil {
		log.Fatalln(err.Error())
		//return err
	}
	/*frequency := 100
	//motor: 2  direction: 1  frequency: 100.0  cycle: 50.0  duration: 10
	command := exec.Command("python", "step.py", "2", "1", strconv.Itoa(frequency),
		strconv.FormatFloat(speed, 'E', 0, 64),
		strconv.FormatFloat(duration, 'E', 0, 64))
	log.Println("Tring to run:", command.String())
	command.Path = "/home/pi"
	err := command.Run()
	if err != nil {
		log.Println("Failed to execute python")
		log.Println(err.Error())
		return err
	}

	log.Println("Executed python")
	*/
	select {
	case <-time.After(time.Duration(duration * float64(time.Second))):
		v[r.pump.Pin] = 0
		if err := r.jacks.Control(r.pump.Jack, v); err != nil {
			log.Fatalln(err.Error())
			return err
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
