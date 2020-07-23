import React from "react";
import ReactPlayer from "react-player";
const Video = () => {
  return (
    <div>
      <h1>Hello</h1>
      <ReactPlayer
        controls
        height="200px"
        width="370px"
        url="youtube.com/watch?v=I7CfaDYzTVM"
      />
    </div>
  );
};

export default Video;
