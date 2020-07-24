import React, { useState } from "react";
import axios from "axios";
// /import axiosConfig from "../config/axiosConfig";
import { Redirect } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [warn, setWarn] = useState("");
  const [redirect, setRedirect] = useState(false);
  const loginUser = () => {
    if (email.length == 0 || password.length == 0) {
      setWarn("All fields are mandatory");
    } else {
      axios
        .post("/api/login", {
          email: email,
          password: password,
        })
        .then((result) => {
          if (result.data === "Login Successfull") {
            setLoginSuccess(true);
            setRedirect(true);
          } else {
            setWarn(result.data);
          }
        });
    }
  };
  const redirectFun = () => {
    if (redirect) {
      return (
        <Redirect
          to={{
            pathname: "/chats",
            state: { isLoggedIn: loginSuccess, id: email },
          }}
        />
      );
    }
  };
  return (
    <div className="container">
      <h1>login.</h1>
      <input
        type="text"
        name=""
        id=""
        placeholder="Email ID"
        onChange={(event) => setEmail(event.target.value)}
      />
      <br />

      <input
        type="password"
        name=""
        id=""
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
      />
      <br />
      <h2 className="warn">{warn}</h2>
      <button className="submit_btn" onClick={loginUser}>
        Login
      </button>
      {redirectFun()}
    </div>
  );
};

export default Login;
