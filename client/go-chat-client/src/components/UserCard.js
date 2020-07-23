import React from "react";
import Potrait from "../images/potrait.jpg";
import Avatar from "../svgs/avatar.svg";
import "./UserCard.scss";
import { BrowserRouter as router, Link, Router } from "react-router-dom";
const UserCard = ({ id, sender, receiverid, url, unread }) => {
  //console.log(unread);
  return (
    <div>
      <div className="individuals">
        {unread ? <div className="badge3"> {unread}</div> : null}

        <img src={url} alt="" className="potrait_image" />

        <Link
          style={{ textDecoration: "none" }}
          to={{
            pathname: "/chats/messages",
            state: {
              sender: sender,
              receiver: receiverid,
              username: id,
            },
          }}
        >
          <p className="indi_name">{id}</p>
        </Link>
      </div>

      <div className="divider2"></div>
    </div>
  );
};

export default UserCard;
