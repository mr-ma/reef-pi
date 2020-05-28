package macro

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

var TaskID = 0

type Macro struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Steps      []Step `json:"steps"`
	Reversible bool   `json:"reversible"`
	TaskID     string `json:"task_id"`
}

func (s *Subsystem) Get(id string) (Macro, error) {
	var m Macro
	return m, s.controller.Store().Get(Bucket, id, &m)
}
func (s *Subsystem) List() ([]Macro, error) {
	ms := []Macro{}
	fn := func(_ string, v []byte) error {
		var m Macro
		if err := json.Unmarshal(v, &m); err != nil {
			return err
		}
		ms = append(ms, m)
		return nil
	}
	return ms, s.controller.Store().List(Bucket, fn)
}

func (s *Subsystem) Create(m Macro) error {
	fn := func(id string) interface{} {
		m.ID = id
		return &m
	}
	return s.controller.Store().Create(Bucket, fn)
}

func (s *Subsystem) Update(id string, m Macro) error {
	m.ID = id
	return s.controller.Store().Update(Bucket, id, m)
}

func (s *Subsystem) Delete(id string) error {
	if err := s.controller.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if err := s.controller.Store().Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  macro subsystem: Failed to deleted usage details for macro:", id)
	}
	return nil
}

func (s *Subsystem) Run(m Macro, reverse bool) error {

	store := s.controller.Store()
	var ss settings.Settings
	store.Get(storage.ReefPiBucket, "settings", &ss)

	CapScheduledMacroTasks := ss.CapScheduledMacroTasks
	hasScheduledMacro := false
	scheduledMacroIndex := -1
	if CapScheduledMacroTasks != 0 {
		s.Lock()
		TaskID++
		m.TaskID = strconv.Itoa(TaskID)
		all := len(s.scheduledmacros)
		s.scheduledmacros = append(s.scheduledmacros, m)
		if all+1 > CapScheduledMacroTasks {
			s.scheduledmacros = s.scheduledmacros[all+1-CapScheduledMacroTasks:]
		}
		scheduledMacroIndex = len(s.scheduledmacros) - 1
		hasScheduledMacro = true
		s.Unlock()
	}
	log.Println("Macro. appended to subsystem", len(s.scheduledmacros))

	if reverse && !m.Reversible {
		return fmt.Errorf("macro is not reversible")
	}
	log.Println("macro subsystem. Running:", m.Name)
	steps := m.Steps
	if reverse {
		steps = []Step{}
		for i := len(m.Steps); i > 0; i-- {
			steps = append(steps, m.Steps[i-1])
		}
		if hasScheduledMacro {
			s.Lock()
			s.scheduledmacros[scheduledMacroIndex].Steps = steps
			s.Unlock()
		}
	}
	if hasScheduledMacro {
		for i, _ := range s.scheduledmacros[scheduledMacroIndex].Steps {
			s.Lock()
			s.scheduledmacros[scheduledMacroIndex].Steps[i].Status = Scheduled
			s.scheduledmacros[scheduledMacroIndex].Steps[i].End = time.Time{}
			s.Unlock()
		}
	}
	for i, step := range steps {
		if hasScheduledMacro {
			s.Lock()
			s.scheduledmacros[scheduledMacroIndex].Steps[i].Start = time.Now()
			s.scheduledmacros[scheduledMacroIndex].Steps[i].Status = Started
			s.Unlock()
		}
		if err := step.Run(s.controller, reverse); err != nil {
			log.Println("ERROR: macro subsystem. Failed to execute step:", i, "of macro", m.Name, ". Error:", err)
		}
		if hasScheduledMacro {
			s.Lock()
			s.scheduledmacros[scheduledMacroIndex].Steps[i].End = time.Now()
			s.scheduledmacros[scheduledMacroIndex].Steps[i].Status = Finished
			s.Unlock()
		}
	}
	log.Println("macro subsystem. Finished:", m.Name)
	return s.Update(m.ID, m)
}
