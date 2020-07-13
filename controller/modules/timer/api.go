package timer

import (
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/timers/schedules", c.Schedules).Methods("GET")
	r.HandleFunc("/api/timers/{id}", c.GetJob).Methods("GET")
	r.HandleFunc("/api/timers", c.ListJobs).Methods("GET")
	r.HandleFunc("/api/timers", c.CreateJob).Methods("PUT")
	r.HandleFunc("/api/timers/{id}", c.UpdateJob).Methods("POST")
	r.HandleFunc("/api/timers/{id}", c.DeleteJob).Methods("DELETE")
}

func (c *Controller) GetJob(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}
func (c *Controller) GetSchedules(Count int) map[string][]time.Time {
	entries := c.runner.Entries()
	entriesSchedules := make(map[string][]time.Time)
	jobCrons := make(map[cron.EntryID]string)
	for key, entryID := range c.cronIDs {
		jobCrons[entryID] = key
	}
	for i := range entries {
		itemCount := Count
		next := entries[i].Next
		nexts := []time.Time{}
		nexts = append(nexts, entries[i].Prev)
		for !next.IsZero() && itemCount > 0 {
			itemCount--
			nexts = append(nexts, next)
			next = entries[i].Schedule.Next(next)
		}
		entriesSchedules[jobCrons[entries[i].ID]] = nexts
	}
	return entriesSchedules
}

func (c *Controller) Schedules(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.GetSchedules(50), nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListJobs(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		v := make(map[string]interface{})
		timers, _ := c.List()
		v["timers"] = timers
		v["schedules"] = c.GetSchedules(50)
		return v, nil
	}

	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) CreateJob(w http.ResponseWriter, r *http.Request) {
	var j Job
	fn := func() error {
		return c.Create(j)
	}
	utils.JSONCreateResponse(&j, fn, w, r)
}

func (c *Controller) UpdateJob(w http.ResponseWriter, r *http.Request) {
	var j Job
	fn := func(id string) error {
		j.ID = id
		return c.Update(id, j)
	}
	utils.JSONUpdateResponse(&j, fn, w, r)
}

func (c *Controller) DeleteJob(w http.ResponseWriter, r *http.Request) {
	utils.JSONDeleteResponse(c.Delete, w, r)
}
