package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := "8080"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)
	fmt.Printf("Mojuli Christ Glorious School Portal running at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
