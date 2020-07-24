import React, { useState, useEffect } from "react";
import axios from "axios";
import * as io from "socket.io-client";
import Avatar from "../svgs/avatar.svg";
import Chats from "../svgs/chats.svg";
import None from "../svgs/none.svg";
import Attach from "../svgs/attach.svg";
import Attachment from "../svgs/attachment.svg";
import "./Messages.scss";
import MessCard from "../components/MessCard";
import ReactPlayer from "react-player";
const SOCKET_ENDPOINT = "localhost:4000";
const socket = io(SOCKET_ENDPOINT);

const Messages = (props) => {
  const sender = props.location.state.sender;
  const receiver = props.location.state.receiver;
  const username = props.location.state.username;

  const [Result, setResult] = useState([]);
  let tempResult = [];
  const [message, setmessage] = useState("");
  const [recsocketid, setrecsocket] = useState("");
  const [last, setLast] = useState(true);
  const [profileImage, setProfile] = useState("");
  const [temp, setTemp] = useState([]);
  const [temp1, setTemp1] = useState();
  const [isSeen, setIsSeen] = useState(false);
  let mess = [];
  socket.on("connect", (s) => {
    // an alphanumeric id...

    console.log(socket.id);
    axios
      .post("/update/socket", {
        sender: sender,
        socket: socket.id,
      })
      .then((result) => console.log("Socket Updated!"));
  });
  socket.on(
    "new message",
    ({ sender, senderid, reciever, message, time, rid }) => {
      let temp3 = [
        {
          sid: sender,
          rid: rid,
          message: message,
          time: time,
        },
      ];
      //console.log(Result.concat(temp3));
      //setTemp(temp3);
      if (Result != null) {
        setResult(Result.concat(temp3));
        // socket.emit("message read", {
        //   sender: sender,
        //   senderid: socket.id,
        //   rid: receiver,
        //   reciever: result.data.reciever,
        // });
      } else {
        setResult(temp3);
      }
    }
  );
  socket.on("message read", ({ sender, senderid, rid, reciever }) => {
    console.log(`Message read by ${sender}`);
    setIsSeen(true);
  });
  const upload = () => {};

  const getChats = () => {
    // const socket = socketIOClient("localhost:8030/", {
    //   transports: ["flashsocket", "polling"],
    // });
    // console.log(socket);
    // socket.on("hello", ({ data }) => {
    //   console.log(data);
    // });
    console.log(sender, receiver);
    // socket.emit("read message", {
    //   sender: sender,
    //   senderid: socket.id,
    //   rid: receiver,
    //   reciever: result.data.reciever,
    // });
    axios
      .post("/api/setunread", {
        receiver: receiver,
        sender: sender,
      })
      .then((res) => console.log(res));
    axios
      .post("/api/socket", {
        reciever: receiver,
      })
      .then((result) => {
        console.log(result.data);
        //setrecsocket(result.data.receiver);
        console.log(result.data.reciever);
        console.log("emitting read message..");
        socket.emit("message read", {
          sender: sender,
          senderid: socket.id,
          rid: receiver,
          reciever: result.data.reciever,
        });
      });
    axios
      .post("/api/getchats", {
        sender: sender,
        receiver: receiver,
      })
      .then((result) => {
        axios
          .post("/api/profile", {
            Reciever: receiver,
          })
          .then((result) => {
            console.log(result.data);
            setProfile(result.data);
          });
        setResult(result.data);
        // mess = result.data;
        // tempResult = result.data;
        // console.log(result.data);
      });
  };

  const mapTemp = () => {
    temp.map((t) => (
      <MessCard
        message={t.message}
        mess_sid={t.sid}
        sid={sender}
        time={t.time}
        isLast={true}
      />
    ));
  };

  const sendMessage = () => {
    axios
      .post("http://localhost:4540/api/new/message", {
        sid: sender,
        rid: receiver,
        message: message,
      })
      .then((result) => {
        console.log("Message sent successfully");
        console.log(result);
        let temp2 = [
          {
            sid: result.data.sid,
            rid: result.data.rid,
            message: result.data.message,
            time:
              new Date().toLocaleDateString() +
              " " +
              new Date().toLocaleTimeString(),
          },
        ];
        //setResult(Result.concat(temp));
        if (Result != null) {
          setResult(Result.concat(temp2));
        } else {
          setResult(temp2);
        }

        axios
          .post("/api/socket", {
            reciever: receiver,
          })
          .then((result) => {
            console.log(result.data);

            console.log(result.data.reciever);
            //setrecsocket(result.data.reciever);
            socket.emit("new message", {
              sender: sender,
              senderid: socket.id,
              rid: receiver,
              reciever: result.data.reciever,
              message: message,
              time:
                new Date().toLocaleDateString() +
                " " +
                new Date().toLocaleTimeString(),
            });
          });
      });

    //setTemp(temp2);

    setmessage("");

    // console.log(receiver);

    //console.log(result);
  };
  //
  useEffect(() => getChats(), []);

  return (
    <div style={{ maxWidth: "100vw", backgroundColor: "white" }}>
      <div className="top_card">
        <div className="text_image">
          <img src={profileImage} alt="" className="left_img" />
          <div className="user">
            <h1
              className="my_chats"
              style={{ margin: "0", marginBottom: "5px", fontSize: "1.48rem" }}
            >
              {username}
            </h1>
            <h4 className="last_seen" style={{ margin: "0" }}>
              Last seen 2min ago
            </h4>
          </div>
        </div>
        <img src={Chats} alt="" className="right_img" />
      </div>
      {Result != null ? (
        <div className="messages">
          {Result.map((mess) =>
            // console.log(
            //   `sid:${sender},mess_sid:${mess.sid},message:${mess.message}`
            // )
            //
            {
              var str = mess.message;
              var res = str.match(
                /^(https\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/
              );
              //console.log(res);
              return res != null ? (
                sender == mess.sid ? (
                  Object.keys(Result).length - 1 == Result.indexOf(mess) ? (
                    <div
                      style={{
                        alignSelf: "flex-end",
                        marginRight: "20px",
                        marginBottom: "100px",
                        boxShadow: "5px 15px 15px rgba(0,0,0,0.5) ",
                      }}
                    >
                      <ReactPlayer
                        url={mess.message}
                        controls
                        height="160px"
                        width="280px"
                      />
                      <a
                        href={mess.message}
                        style={{ textDecorationColor: "#1e90ff" }}
                      >
                        <p
                          style={{
                            marginTop: "5px",
                            textAlign: "center",
                            color: "#1e90ff",
                            fontSize: "15px",
                          }}
                        >
                          {mess.message}
                        </p>
                      </a>
                    </div>
                  ) : (
                    <div
                      style={{
                        alignSelf: "flex-end",
                        marginRight: "20px",
                        marginBottom: "20px",
                        boxShadow: "5px 15px 15px rgba(0,0,0,0.5) ",
                      }}
                    >
                      <ReactPlayer
                        url={mess.message}
                        controls
                        height="160px"
                        width="280px"
                      />
                      <a
                        href={mess.message}
                        style={{ textDecorationColor: "#1e90ff" }}
                      >
                        <p
                          style={{
                            marginTop: "5px",
                            textAlign: "center",
                            color: "#1e90ff",
                            fontSize: "15px",
                          }}
                        >
                          {mess.message}
                        </p>
                      </a>
                    </div>
                  )
                ) : Object.keys(Result).length - 1 == Result.indexOf(mess) ? (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      marginLeft: "20px",
                      marginBottom: "100px",
                      boxShadow: "5px 15px 15px rgba(0,0,0,0.5) ",
                    }}
                  >
                    <ReactPlayer
                      url={mess.message}
                      controls
                      height="160px"
                      width="280px"
                    />
                    <a
                      href={mess.message}
                      style={{ textDecorationColor: "#1e90ff" }}
                    >
                      <p
                        style={{
                          marginTop: "5px",
                          textAlign: "center",
                          color: "#1e90ff",
                          fontSize: "15px",
                        }}
                      >
                        {mess.message}
                      </p>
                    </a>
                  </div>
                ) : (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      marginLeft: "20px",
                      marginBottom: "20px",
                      boxShadow: "5px 15px 15px rgba(0,0,0,0.5) ",
                    }}
                  >
                    <ReactPlayer
                      url={mess.message}
                      controls
                      height="160px"
                      width="280px"
                    />
                    <a
                      href={mess.message}
                      style={{ textDecorationColor: "#1e90ff" }}
                    >
                      <p
                        style={{
                          marginTop: "5px",
                          textAlign: "center",
                          color: "#1e90ff",
                          fontSize: "15px",
                        }}
                      >
                        {mess.message}
                      </p>
                    </a>
                  </div>
                )
              ) : Object.keys(Result).length - 1 == Result.indexOf(mess) ? (
                <MessCard
                  message={mess.message}
                  mess_sid={mess.sid}
                  sid={sender}
                  time={mess.time}
                  isLast={true}
                  isSeen={mess.i_read || isSeen}
                />
              ) : (
                <MessCard
                  message={mess.message}
                  mess_sid={mess.sid}
                  sid={sender}
                  time={mess.time}
                  isLast={false}
                  isSeen={mess.i_read || isSeen}
                />
              );
            }
          )}
          {/* {temp && temp.message != null && temp.message != "" ? (
          <MessCard
            message={temp.message}
            mess_sid={temp.sid}
            sid={sender}
            time={temp.time}
            isLast={true}
          />
        ) : null} */}
        </div>
      ) : (
        <div className="empty">
          <h1 style={{ color: "#71C9FF", textAlign: "center" }}>
            Start chatting...
          </h1>
          <img src={None} className="emptyImage" />
        </div>
      )}

      <div className="send_message">
        <input
          type="text"
          name=""
          id="sender"
          placeholder="Type a message..."
          value={message}
          onChange={(event) => setmessage(event.target.value)}
          onKeyPress={(event) => {
            if (event.key == "Enter") {
              sendMessage();
            }
          }}
          style={{ backgroundColor: "white" }}
        />
        <img src={Attachment} alt="" className="ico" />
        <img src={Attach} alt="" className="ico" />
      </div>
    </div>
  );
};

export default Messages;
