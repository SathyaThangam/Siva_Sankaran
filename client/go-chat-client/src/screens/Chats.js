import React from "react";
import { Redirect } from "react-router-dom";
import Chats2 from "./Chats2";
const Chats = (props) => {
  return (
    <div>
      {props.location.state ? (
        props.location.state.isLoggedIn == true ? (
          <Chats2 id={props.location.state.id} />
        ) : (
          <Redirect to="/login" />
        )
      ) : (
        <Redirect to="/login" />
      )}
    </div>
  );
};

export default Chats;
