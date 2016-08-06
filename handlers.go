package main

import (
	"encoding/json"
	"net/http"
)

func FiltersList(w http.ResponseWriter, r *http.Request) {
	filters := RepoGetFilters()
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	json.NewEncoder(w).Encode(filters)
}
