package main

import (
	"log"
)

func RepoGetFilters(deptId string) FilterGroups {
	var (
		id      int
		name    string
		caption string
	)
	rows, err := db.Query("select id, name, caption from filter_groups where dept_id = ? order by rank", deptId)
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
    // Let's get all filters in this group
    filtersInGroup := getFilters(id)
		filterGroup := FilterGroup{
			Id:      id,
			Name:    name,
			Caption: caption,
			Content: filtersInGroup,
		}
		filters = append(filters, filterGroup)
	}
	return filters
}


func getFilters(groupId int) Filters {
	var (
		id      int
		name    string
	)
  rows, err := db.Query("select id, name from filters where group_id = ? order by rank", groupId)
  if err != nil {
    log.Fatal(err)
  }
  defer rows.Close()
  filters := Filters{}
  for rows.Next() {
		err := rows.Scan(&id, &name)
		if err != nil {
			log.Fatal(err)
		}

		filter := Filter{
			Id:      id,
			Name:    name,
		}
		filters = append(filters, filter)
	}
	return filters
}
