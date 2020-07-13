package leak

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

//API
func (e *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/leaks/status/{id}", e.Status).Methods("POST")
	r.HandleFunc("/api/leaks/{id}", e.GetLeak).Methods("GET")
	r.HandleFunc("/api/leaks", e.ListLeak).Methods("GET")
	r.HandleFunc("/api/leaks", e.CreateLeak).Methods("PUT")
	r.HandleFunc("/api/leaks/{id}", e.UpdateLeak).Methods("POST")
	r.HandleFunc("/api/leaks/{id}", e.DeleteLeak).Methods("DELETE")
}

func (c *Controller) Status(w http.ResponseWriter, r *http.Request) {
	log.Println("INFO. Leak sub-system: sensor report recieved..")
	var status SensorStatus
	fn := func(id string) error {
		leaks, _ := c.List()
		for _, lk := range leaks {
			if lk.EndpointID == id {
				status.Date = time.Now()
				//if the macro takes long the post would throw timeout on the post request
				//therefore, we need to handle the status asynchronously
				go c.HandleStatusReport(lk, status)
				return nil
			}
		}
		return errors.New("Did not find the leak sensor with the given endpoint id")
	}
	utils.JSONUpdateResponse(&status, fn, w, r)
}

func (c *Controller) GetLeak(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) ListLeak(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) CreateLeak(w http.ResponseWriter, r *http.Request) {
	var lk Leak
	fn := func() error {
		return c.Create(lk)
	}
	utils.JSONCreateResponse(&lk, fn, w, r)
}

func (c *Controller) UpdateLeak(w http.ResponseWriter, r *http.Request) {
	var lk Leak
	fn := func(id string) error {
		return c.Update(id, lk)
	}
	utils.JSONUpdateResponse(&lk, fn, w, r)
}

func (c *Controller) DeleteLeak(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
