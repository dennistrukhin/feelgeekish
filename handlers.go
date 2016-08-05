package main

import (
  "net/http"
  "encoding/json"
)

func FiltersList(w http.ResponseWriter, r *http.Request) {
  filters := FilterGroups{
    FilterGroup {
      Id: 1,
      Name: "Material",
      Caption: "What is it made from?",
      Content: Filters {
        Filter {Id: 101, Name: "wood"},
        Filter {Id: 102, Name: "steel"},
      },
    },
    FilterGroup {
      Id: 2,
      Name: "Color",
      Caption: "What colors does it have?",
      Content: Filters {
        Filter {Id: 201, Name: "white"},
        Filter {Id: 211, Name: "yellow"},
      },
    },
  }

  json.NewEncoder(w).Encode(filters)
}
