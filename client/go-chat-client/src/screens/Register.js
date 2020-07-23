import React, { useState, useEffect, useRef } from "react";
import "./Register.scss";
import axios from "axios";
import { Router, Redirect, Link } from "react-router-dom";
const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warn, setWarn] = useState("");
  const [redirect, setRedirect] = useState(false);
  const inputFile = useRef(null);
  const [image, setImage] = useState();
  const [imageSRC, setImageSRC] = useState("");
  const [uploading, setUploading] = useState(false);

  const registerUser = () => {
    if (email.length == 0 || username.length == 0 || password.length == 0) {
      setWarn("All are mandatory");
    } else {
      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };
      axios
        .post("http://localhost:6725/api/new/user", {
          email: email,
          username: username,
          password: password,
        })
        .then((result) => {
          if (result.data == "User Creation Successfull") {
            console.log("success");
            axios
              .post("http://localhost:6725/update/profile", {
                email: email,
                url: imageSRC,
              })
              .then(() => {
                setWarn(result.data);
                setTimeout(() => setRedirect(true), 1000);
              });
          } else {
            setWarn(result.data);
          }
        });
    }
  };
  const redirectFun = () => {
    if (redirect) {
      return <Redirect to="/login" />;
    }
  };
  const onButtonClick = () => {
    // `current` points to the mounted file input element
    inputFile.current.click();
  };
  const handleImageChange = (e) => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      setImage(file);
    };
    reader.readAsDataURL(file);
    console.log(file);
    setWarn("Uploading...");
    let data = new FormData();
    data.append("file", file);
    axios.post("http://localhost:4000/api/images", data).then((result) => {
      console.log(result.data.url);
      setWarn("");
      setImageSRC(result.data.url);
    });
  };
  const renderImage = () => {
    if (imageSRC != "") {
      let url = imageSRC.split("/");
      let mid = "w_400,h_400,c_crop,g_face,r_max/w_200/";
      let temp =
        url[0] +
        "//" +
        url[2] +
        "/" +
        url[3] +
        "/" +
        url[4] +
        "/" +
        url[5] +
        "/" +
        mid +
        url[6] +
        "/" +
        url[7];
      return <img src={temp} alt="profile pic" className="profileRender" />;
    }
  };
  return (
    <div className="container">
      <h1>register.</h1>
      {renderImage()}
      <div>
        <input
          type="file"
          id="profile"
          ref={inputFile}
          style={{ display: "none" }}
          onChange={(e) => handleImageChange(e)}
        />
        <button className="profileUpload" onClick={onButtonClick}>
          +
        </button>
        <input hidden id="fileUpload" type="file" accept="image/*" />
      </div>
      <input
        type="text"
        name=""
        id=""
        placeholder="Email ID"
        onChange={(event) => setEmail(event.target.value)}
      />
      <br />
      <input
        type="text"
        name=""
        id=""
        placeholder="Username"
        onChange={(event) => setUsername(event.target.value)}
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

      <button className="submit_btn" onClick={registerUser}>
        Submit
      </button>
      <Link to="/login" style={{ textDecoration: "none" }}>
        <p
          style={{
            marginTop: "20px",
          }}
          className="loginLink"
        >
          Already have an account? Login.
        </p>
      </Link>

      {redirectFun()}
    </div>
  );
};
export default Register;
