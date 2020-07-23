import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import chats from "../svgs/chats.svg";
import message from "../svgs/no_messages.svg";
import "./Chats2.scss";
import * as io from "socket.io-client";
import Potrait from "../images/potrait.jpg";
import UserCard from "../components/UserCard";

const Chats2 = ({ id }) => {
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState("");
  const [warn, setWarn] = useState("");
  const [unread, setUnread] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [userUnread, setuserUnread] = useState([]);
  const [show, setShow] = useState(true);
  const inputFile = useRef(null);
  const updateSocket = () => {};
  const getmessages = () => {
    axios
      .post("http://localhost:6790/api/profile", {
        reciever: id,
      })
      .then((result) => {
        console.log(result.data);
        setProfile(result.data);
        // /setUnread(result.data.unread);
      });
    axios.get(`http://localhost:6790/api/getmessages/${id}`).then((results) => {
      console.log(results.data);
      setUsers(results.data);
      axios
        .post("http://localhost:6790/api/getunread", {
          reciever: id,
        })
        .then((res) => {
          console.log(res.data);
          setuserUnread(res.data);
        });
    });
  };
  const onButtonClick = () => {
    // `current` points to the mounted file input element
    inputFile.current.click();
  };

  const getAllUsers = () => {
    axios
      .get(`http://localhost:6790/api/allusers/${id}`)
      .then((result) => setAllUsers(result.data));
    if (show == true) {
      setShow(false);
    } else {
      setShow(true);
    }
  };
  const handleImageChange = (e) => {
    e.preventDefault();
    setWarn("Updating Profile Picture");
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      //setImage(file);
    };
    reader.readAsDataURL(file);
    console.log(file);
    // setWarn("Uploading...");
    let data = new FormData();
    data.append("file", file);
    axios.post("http://localhost:4000/api/images", data).then((result) => {
      console.log(result.data.url);
      //setProfile(result.data.url);
      axios
        .post("http://localhost:6790/update/profile", {
          email: id,
          url: result.data.url,
        })
        .then((res) => {
          console.log("Profile Image Updated");

          setWarn("");
          setProfile(result.data.url);
        });
    });
  };
  useEffect(() => getmessages(), []);
  useEffect(() => updateSocket(), []);
  return (
    <div>
      <div className="chats_header">
        <h1 className="my_chats">My Chats</h1>
        <input
          type="file"
          id="profile"
          ref={inputFile}
          style={{ display: "none" }}
          onChange={(e) => handleImageChange(e)}
        />
        <div className="end">
          <div>
            <img src={profile} className="prof_ico" onClick={onButtonClick} />
            <input hidden id="fileUpload" type="file" accept="image/*" />
          </div>
          {unread != 0 ? (
            <div className="badgeDiv">
              <div className="badge">{unread}</div>
              <img src={chats} className="chat_ico" onClick={getAllUsers} />
            </div>
          ) : (
            <img src={chats} className="chat_ico" onClick={getAllUsers} />
          )}
        </div>
      </div>
      <div className="divider"></div>
      {allUsers.length > 0 && !show ? (
        <div style={{ marginTop: "40px" }}>
          <h1 className="gradientText">All Available Users</h1>
          <div className="divider2"></div>
          {allUsers.map((user) => (
            <UserCard
              id={user.username}
              receiverid={user.email}
              sender={id}
              url={user.url}
            />
          ))}
        </div>
      ) : null}
      {users && show ? (
        <div style={{ marginTop: "40px" }}>
          {users.map((user) => {
            var unread = 0;
            if (userUnread != null) {
              var c = userUnread.filter(function (t) {
                return t.sid == user.email;
              });
              //console.log(c[0]);
              // var unread = 0;
              if (c[0]) {
                unread = c[0].unread;
              }
            }

            return (
              <UserCard
                id={user.username}
                receiverid={user.email}
                sender={id}
                url={user.url}
                unread={unread}
              />
            );
          })}
        </div>
      ) : show ? (
        <div className="empty">
          <h1>Oh oh...No chats yet!</h1>
          <img src={message} className="emptyImage" />
        </div>
      ) : null}
      <h1 className="warn2">{warn}</h1>
    </div>
  );
};

export default Chats2;
