package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/rs/cors"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
	"golang.org/x/crypto/bcrypt"
)

type userMessage struct {
	SID     string `json:"sid"`
	RID     string `json:"rid"`
	Message string `json:"message"`
	Time    string `json:"time"`
	I_read  bool   `json:"i_read"`
}

const (
	host     = "localhost"
	port     = 5455
	user     = "postgres"
	password = "vijaysri13"
	dbname   = "chatData"
)

type User struct {
	Email    string `json:"email"`
	UserName string `json:"username"`
	Password string `json:"password"`
}
type User2 struct {
	Email    string `json:"email"`
	UserName string `json:"username"`
	Url      string `json:"url"`
}
type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type UserDetails struct {
	UserID   string `json:"email"`
	Username string `json:"username"`
	Profile  string `json:"url"`
}
type SenderReceier struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
}
type SocketDetails struct {
	Sender string `json:"sender"`
	Socket string `json:"socket"`
}
type RecieverDetails struct {
	Reciever string `json:"reciever"`
}
type ProfileDetails struct {
	Email string `json:"email"`
	Url   string `json:"url"`
}
type ProfileUnread struct {
	Url    string `json:"url"`
	Unread int    `json:"unread"`
}
type RecieverDetails2 struct {
	Sender string `json:"sid"`
	Unread int    `json:"unread"`
}

var db *sql.DB
var err error

func connectDatabase() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	fmt.Println("Successfully connected to the database!")
	fmt.Printf("%T", err)
	return db
}
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Content-Type", "application/json")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}
func registerNewUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("New User Registration called")

	//w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	var newUser User
	_ = json.NewDecoder(r.Body).Decode(&newUser)
	queryStatement := "select * from users where email=$1"
	row := db.QueryRow(queryStatement, newUser.Email)
	var tempUser User
	switch err := row.Scan(&tempUser.Email, &tempUser.UserName, &tempUser.Password); err {
	case sql.ErrNoRows:
		password := []byte(newUser.Password)
		hashedPassword, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
		if err != nil {
			panic(err)
		}
		sqlStatement2 := `INSERT INTO users VALUES ($1, $2, $3)`
		_, err = db.Exec(sqlStatement2, newUser.Email, hashedPassword, newUser.UserName)

		json.NewEncoder(w).Encode("User Creation Successfull")
	case nil:

		json.NewEncoder(w).Encode("User Already exists")
	default:
		panic(err)
	}

}
func login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Login Module")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	var tempLogin Login
	var tempUser User
	_ = json.NewDecoder(r.Body).Decode(&tempLogin)
	queryStatement := "select email,password,username from users where email=$1"
	row := db.QueryRow(queryStatement, tempLogin.Email)
	switch err := row.Scan(&tempUser.Email, &tempUser.Password, &tempUser.UserName); err {
	case sql.ErrNoRows:

		json.NewEncoder(w).Encode("User does not exists")

	case nil:
		hashed := []byte(tempUser.Password)
		pass := []byte(tempLogin.Password)
		errPass := bcrypt.CompareHashAndPassword(hashed, pass)
		if errPass != nil {
			fmt.Println(errPass)

			json.NewEncoder(w).Encode("Password is incorrect")
		} else {

			json.NewEncoder(w).Encode("Login Successfull")
		}
	default:
		panic(err)
	}

}
func getMessages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	params := mux.Vars(r)
	sqlStatement := `Select distinct username,rid,profile_url from users,chats where email in (Select rid from chats where sid = $1) and rid=email union  Select distinct username,sid,profile_url from users,chats where email in (select sid from chats where rid = $1) and email=sid ;`
	rows, err := db.Query(sqlStatement, params["email_id"])
	if err != nil {
		panic(err)
	}
	var names []UserDetails
	defer rows.Close()
	for rows.Next() {
		var name UserDetails

		err := rows.Scan(&name.Username, &name.UserID, &name.Profile)
		fmt.Println(name)
		if err != nil {
			panic(err)
		}
		names = append(names, name)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Println(names)
	json.NewEncoder(w).Encode(names)

}
func getChatData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var request SenderReceier
	_ = json.NewDecoder(r.Body).Decode(&request)
	fmt.Println(request)
	// sqlStatement := `select sid,rid,sent_message,sent_time from chats where sid = $1 and rid = $2;`
	unionStatement := `select * from chats where sid=$1 and rid=$2 
	union
	select * from chats where sid=$2 and rid=$1
	 order by sent_time asc;`
	rows, err := db.Query(unionStatement, request.Sender, request.Receiver)

	if err != nil {
		panic(err)
	}
	var chats []userMessage
	defer rows.Close()
	for rows.Next() {
		var chat userMessage

		err := rows.Scan(&chat.SID, &chat.RID, &chat.Message, &chat.Time, &chat.I_read)
		//fmt.Println(chat)
		if err != nil {
			panic(err)
		}
		chats = append(chats, chat)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(chats)

}

func updateSocket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Updation Called")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	sqlInsert := ` UPDATE users SET socket = $1 WHERE email = $2 ;`

	var tempSocket SocketDetails
	_ = json.NewDecoder(r.Body).Decode(&tempSocket)
	fmt.Println(tempSocket.Socket)
	_, err = db.Exec(sqlInsert, tempSocket.Socket, tempSocket.Sender)
	if err != nil {
		panic(err)
	}
	json.NewEncoder(w).Encode("Socket Updation Successfull")

}
func updateProfile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Profile Updation Called")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	sqlInsert := ` UPDATE users SET profile_url = $1 WHERE email = $2 ;`

	var tempProfile ProfileDetails
	_ = json.NewDecoder(r.Body).Decode(&tempProfile)
	fmt.Println(tempProfile.Url)
	_, err = db.Exec(sqlInsert, tempProfile.Url, tempProfile.Email)
	if err != nil {
		panic(err)
	}
	json.NewEncoder(w).Encode("Profile Updation Successfull")

}
func getAllUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	params := mux.Vars(r)
	// sqlStatement := `Select distinct username,rid,profile_url from users,chats where email in (Select rid from chats where sid = $1) and rid=email union  Select distinct username,sid,profile_url from users,chats where email in (select sid from chats where rid = $1) and email=sid ;`
	sqlStatement := `Select email,username,profile_url from users where email != $1`
	rows, err := db.Query(sqlStatement, params["email"])
	if err != nil {
		panic(err)
	}
	var names []User2
	defer rows.Close()
	for rows.Next() {
		var name User2

		err := rows.Scan(&name.Email, &name.UserName, &name.Url)
		fmt.Println(name)
		if err != nil {
			panic(err)
		}
		names = append(names, name)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Println(names)
	json.NewEncoder(w).Encode(names)

}
func getSocket(w http.ResponseWriter, r *http.Request) {
	var email RecieverDetails
	var temp RecieverDetails
	_ = json.NewDecoder(r.Body).Decode(&email)
	queryStatement := "select socket from users where email=$1"
	row := db.QueryRow(queryStatement, email.Reciever)
	row.Scan(&temp.Reciever)
	json.NewEncoder(w).Encode(temp)
}
func getProfile(w http.ResponseWriter, r *http.Request) {
	var email RecieverDetails
	var url string
	_ = json.NewDecoder(r.Body).Decode(&email)
	queryStatement := "select profile_url from users where email=$1"
	row := db.QueryRow(queryStatement, email.Reciever)
	row.Scan(&url)
	json.NewEncoder(w).Encode(url)
}
func getUnreadCount(w http.ResponseWriter, r *http.Request) {
	var email RecieverDetails
	_ = json.NewDecoder(r.Body).Decode(&email)
	queryStatement := "Select sid,count(*) from chats where rid = $1 and i_read='0' group by sid;"
	rows, err := db.Query(queryStatement, email.Reciever)
	if err != nil {
		panic(err)
	}
	var names []RecieverDetails2
	defer rows.Close()
	for rows.Next() {
		var name RecieverDetails2

		err := rows.Scan(&name.Sender, &name.Unread)
		fmt.Println(name)
		if err != nil {
			panic(err)
		}
		names = append(names, name)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Println(names)
	json.NewEncoder(w).Encode(names)

}
func setUnreadCount(w http.ResponseWriter, r *http.Request) {
	var sr SenderReceier
	_ = json.NewDecoder(r.Body).Decode(&sr)
	queryStatement := `UPDATE chats set i_read = '1' where sid = $1 and rid = $2`
	_, err := db.Query(queryStatement, sr.Receiver, sr.Sender)
	if err != nil {
		panic(err)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode("Updated!")
}
func main() {

	db = connectDatabase()
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		fmt.Println("Failed Initializing Broker Connection")
		panic(err)
	}

	ch, err := conn.Channel()
	if err != nil {
		fmt.Println(err)
	}
	defer ch.Close()

	if err != nil {
		fmt.Println(err)
	}

	msgs, err := ch.Consume(
		"MessageQueue",
		"",
		true,
		false,
		false,
		false,
		nil,
	)

	forever := make(chan bool)
	go func() {
		for d := range msgs {
			var newMessage userMessage
			t := time.Now()
			currentTime := t.Format("01-02-2006 15:04")
			fmt.Println(currentTime)
			err := json.Unmarshal(d.Body, &newMessage)
			if err != nil {
				log.Println(err)
			}
			sqlStatement := `INSERT INTO chats VALUES ($1, $2, $3 ,$4,false)`
			//sqlStatement2 := `UPDATE users SET unread = unread + 1 where email = $1`

			_, err = db.Exec(sqlStatement, newMessage.SID, newMessage.RID, newMessage.Message, currentTime)
			if err != nil {
				panic(err)
			}
			fmt.Printf("Recieved Message: %s\n", d.Body)
			// _, err = db.Exec(sqlStatement2, newMessage.RID)
			// if err != nil {
			// 	panic(err)
			// }
		}
	}()

	fmt.Println("Successfully Connected to our RabbitMQ Instance")
	fmt.Println(" [*] - Waiting for messages")
	// server, err := socketio.NewServer(nil)
	// if err != nil {
	// 	panic(err)
	// }
	// server.OnConnect("/", func(s socketio.Conn) error {
	// 	s.SetContext("")
	// 	fmt.Println("connected:", s.ID())
	// 	return nil
	// })
	r := mux.NewRouter()
	r.HandleFunc("/api/getmessages/{email_id}", getMessages).Methods("GET")
	r.HandleFunc("/api/getchats", getChatData).Methods("POST")
	r.HandleFunc("/api/new/user", registerNewUser).Methods("POST")
	r.HandleFunc("/api/login", login).Methods("POST")
	r.HandleFunc("/update/socket", updateSocket).Methods("POST")
	r.HandleFunc("/update/profile", updateProfile).Methods("POST")
	r.HandleFunc("/api/socket", getSocket).Methods("POST")
	r.HandleFunc("/api/profile", getProfile).Methods("POST")
	r.HandleFunc("/api/allusers/{email}", getAllUsers).Methods("GET")
	r.HandleFunc("/api/getunread", getUnreadCount).Methods("POST")
	r.HandleFunc("/api/setunread", setUnreadCount).Methods("POST")

	handler := cors.Default().Handler(r)
	log.Fatal(http.ListenAndServe(":6790", handler))
	<-forever
}
