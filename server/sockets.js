const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
var fs = require("fs");
const path = require("path");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server = app.listen(4000, () => {
  console.log("Listening on port 4000");
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE");
  next();
});

//Configuring Cloudinary

cloudinary.config({
  cloud_name: "angular-chat",
  api_key: "936977829978845",
  api_secret: "9l3xKcXrsn0CULJfeftsQdCwBCw",
});

//SOCKET UPDATION

const storage = multer.memoryStorage();
const multerUploads = multer({ storage });

// IMAGE UPLOAD API
app.post("/api/images", multerUploads.single("file"), (request, response) => {
  // collected image from a user

  console.log(request.file);

  // upload image here
  return new Promise((resolve, reject) => {
    if (request.file) {
      // console.log(req.file.processedImage.toString('base64'));
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(`Upload succeed: ${res}`);
            // filteredBody.photo = result.url;
            console.log(res.url);
            response.send({ url: res.url });

            resolve(res);
          }
        })

        .end(request.file.buffer);
    }
  });
});

// SOCKET BUISINESS LOGIC

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log(`New user connected- ${socket.id}`);

  socket.on(
    "new message",
    ({ sender, senderid, rid, reciever, message, time }) => {
      console.log(sender, reciever, message, time);

      socket.broadcast
        .to(reciever)
        .emit("new message", { sender, reciever, message, time, rid });
    }
  );

  socket.on("message read", ({ sender, senderid, rid, reciever }) => {
    socket.broadcast
      .to(reciever)
      .emit("message read", { sender, senderid, rid, reciever });
  });
});
