package flow

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (f *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/fcs", f.list).Methods("GET")
	r.HandleFunc("/api/fcs", f.create).Methods("PUT")
	r.HandleFunc("/api/fcs/{id}", f.get).Methods("GET")
	r.HandleFunc("/api/fcs/{id}/current_reading", f.currentReading).Methods("GET")
	r.HandleFunc("/api/fcs/{id}/read", f.read).Methods("GET")
	r.HandleFunc("/api/fcs/{id}", f.update).Methods("POST")
	r.HandleFunc("/api/fcs/{id}", f.delete).Methods("DELETE")
	r.HandleFunc("/api/fcs/{id}/usage", f.getUsage).Methods("GET")
}
func (f *Controller) currentReading(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		fc, err := f.Get(id)
		if err != nil {
			return nil, err
		}
		v := make(map[string]float64)
		v["flow"] = fc.FlowCount
		return v, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (f *Controller) read(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		fc, err := f.Get(id)
		if err != nil {
			return nil, err
		}
		return f.Read(*fc)
	}
	utils.JSONGetResponse(fn, w, r)

}

func (f *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return f.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var f FC
	fn := func() error {
		return c.Create(f)
	}
	utils.JSONCreateResponse(&f, fn, w, r)
}

func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (f *Controller) getUsage(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) { return f.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var f FC
	fn := func(id string) error {
		return c.Update(id, &f)
	}
	utils.JSONUpdateResponse(&f, fn, w, r)
}
