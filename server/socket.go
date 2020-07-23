package main

import (
	"fmt"
	"log"
	"net/http"

	socketio "github.com/googollee/go-socket.io"
	"github.com/rs/cors"
)

func main() {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	server.OnConnect("/", func(s socketio.Conn) error {
		id = s.ID()
		fmt.Println("connected:", s.ID())

		return nil
	})
	server.BroadcastToRoom("1", "hello", func(so socketio.Conn, data string) {
		log.Println("Client ACK with data: ", data)
	})
	go server.Serve()
	defer server.Close()
	mux := http.NewServeMux()
	mux.Handle("/", server)
	// handler := cors.Default().Handler(mux)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
	})

	// decorate existing handler with cors functionality set in c
	handler := c.Handler(mux)
	log.Fatal(http.ListenAndServe(":8035", handler))
}
