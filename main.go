package main

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("mysql", "feelgeekish:U2tZhv4YLBFLteWF@tcp(127.0.0.1:3306)/feelgeekish")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/dept/{deptId}/filters", FiltersList)

	log.Fatal(http.ListenAndServe(":8090", router))
}
