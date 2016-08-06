package main

type Category struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
	Rank int    `json:"rank"`
}

type Categories []Category
