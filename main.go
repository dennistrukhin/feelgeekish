package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
)



func main() {
  router := mux.NewRouter().StrictSlash(true)
  router.HandleFunc("/filters", FiltersList)

  log.Fatal(http.ListenAndServe(":8090", router))
}
