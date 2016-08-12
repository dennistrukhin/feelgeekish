package main

import (
	"encoding/json"
	"net/http"
	"github.com/gorilla/mux"
	// "log"
)

func FiltersList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
  deptId := vars["deptId"]
	filters := RepoGetFilters(deptId)
	// w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	json.NewEncoder(w).Encode(filters)
}
