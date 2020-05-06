package flow

import (
	"log"

	"github.com/kidoman/embd"
)

func detectFlowSensorDevice() (string, error) {
	// files, err := filepath.Glob("/sys/bus/w1/devices/28-*")
	// if err != nil {
	// 	return "", err
	// }
	// if len(files) != 1 {
	// 	return "", fmt.Errorf("Only one flow device expected, found: %d", len(files))
	// }
	// return filepath.Join(files[0], "w1_slave"), nil
	return "", nil
}
func (fc *FC) Listen(devMode bool, pin *embd.DigitalPin, pulse chan interface{}, quit chan struct{}) error {
	log.Println("Listening to flow from sensor:", fc.Name, fc.Pin)
	if devMode {
		log.Println("Flow controller is running in dev mode, skipping sensor listening.")
		return nil
	}
	if pulse == nil {
		log.Fatalln("Flow controller. Listen. Pulse is null")
	}
	err := (*pin).Watch(embd.EdgeFalling, func(pin embd.DigitalPin) {
		log.Println("Flow controller. flowsensor:", fc.ID, " ", fc.Name, " pulse observed")
		pulse <- 1
	})
	if err != nil {
		log.Fatalln("Flow controller", err.Error())
		// log.Println("ERROR: flow sub-system. Failed to read  sensor. Error:", err)
		// c.c.LogError("fc-"+f.ID, "flow sub-system. Failed to read  sensor "+f.Name+". Error:"+err.Error())
		// subject := fmt.Sprintf("Flow sensor '%s' failed", f.Name)
		// c.c.Telemetry().Alert(subject, "Flow sensor failure. Error:"+err.Error())
		return err
	}
	for {
		select {
		case <-pulse:
			log.Println("Flow controller. Sensing pulse in sensor.go ",
				fc.PulseCount)
			fc.Lock()
			fc.PulseCount++
			fc.Unlock()
		case <-quit:
			log.Println("Flow controller. Quit listening to flow from sensor:", fc.Name, fc.Pin)
			return nil
		}
	}
}

func (c *Controller) Read(fc FC) (uint64, error) {
	log.Println("Reading flow from device:", fc.Name, fc.Pin)
	if c.devMode {
		log.Println("Flow controller is running in dev mode, skipping sensor reading.")
		return 2191, nil
	}
	return fc.PulseCount, nil
}
