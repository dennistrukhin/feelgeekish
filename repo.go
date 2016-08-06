package main

import (
	"log"
)

func RepoGetFilters() FilterGroups {
	var (
		id      int
		name    string
		caption string
	)
	rows, err := db.Query("select id, name, caption from filter_group order by rank")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	filters := FilterGroups{}
	for rows.Next() {
		err := rows.Scan(&id, &name, &caption)
		if err != nil {
			log.Fatal(err)
		}
		filterGroup := FilterGroup{
			Id:      id,
			Name:    name,
			Caption: caption,
			Content: Filters{
				Filter{Id: 101, Name: "wood"},
				Filter{Id: 102, Name: "steel"},
			},
		}
		filters = append(filters, filterGroup)
	}
	return filters
}
