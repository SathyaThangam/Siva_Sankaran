package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/streadway/amqp"
)

type userMessage struct {
	SID     string `json:"sid"`
	RID     string `json:"rid"`
	Message string `json:"message"`
}

var ch *amqp.Channel

func publishNewMessage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("New Message Publisher called")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	var newMessage userMessage
	_ = json.NewDecoder(r.Body).Decode(&newMessage)
	json.NewEncoder(w).Encode(&newMessage)
	bytes, _ := json.Marshal(newMessage)
	//fmt.Println(ch)
	err := ch.Publish("", "MessageQueue", false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        []byte(string(bytes)),
	})
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Successfully Published Message to Queue")

}

func main() {

	conn, err0 := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err0 != nil {
		fmt.Println("Connection error")
		panic(1)
	}
	defer conn.Close()

	fmt.Println("Successfully Connected to our RabbitMQ Instance")

	ch, _ = conn.Channel()
	// fmt.Printf("%T", err1)
	// if err1 != nil {
	// 	fmt.Println(err1)
	// }

	q, err2 := ch.QueueDeclare(
		"MessageQueue",
		false,
		false,
		false,
		false,
		nil,
	)
	fmt.Println(q)

	if err2 != nil {
		fmt.Println(err2)
	}

	r := mux.NewRouter()
	handler := cors.Default().Handler(r)
	r.HandleFunc("/api/new/message", publishNewMessage).Methods("POST")

	log.Fatal(http.ListenAndServe(":4540", handler))
}
