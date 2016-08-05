package main

type Filter struct {
  Id    int     `json:"id"`
  Name  string  `json:"name"`
}

type Filters []Filter

type FilterGroup struct {
  Id      int     `json:"id"`
  Name    string  `json:"name"`
  Caption string  `json:"caption"`
  Content Filters `json:"content"`
}

type FilterGroups []FilterGroup
