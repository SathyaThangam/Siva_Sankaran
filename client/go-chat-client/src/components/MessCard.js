import React from "react";
const style1 = {
  boxShadow: "-3px 4px 12px rgba(0,0,0,0.2)",
  borderRadius: "20px",
  padding: "8px",
  alignSelf: "flex-end",
  maxWidth: "100%",
  marginRight: "12px",
};
const style2 = {
  boxShadow: "-3px 4px 12px rgba(0,0,0,0.2)",
  borderRadius: "20px",
  padding: "5px",
  alignSelf: "flex-start",
  color: "#7490F4",
  marginLeft: "12px",
};
const MessCard = ({ message, mess_sid, sid, time, isLast, isSeen }) => {
  const rendering = () => {
    if (mess_sid == sid) {
      return (
        <>
          <div style={style1}>
            <p className="message_sent">{message}</p>
            {isSeen ? (
              <p style={{ color: "#7490F4", fontSize: "0.9rem" }}>
                &#10003;&#10003;
              </p>
            ) : (
              <p style={{ fontSize: "0.9rem" }}>&#10003;&#x2713;</p>
            )}
          </div>
          {isLast ? (
            <p
              style={{
                border: "2px solid red",
                alignSelf: "flex-end",
                color: "rgba(0,0,0,0.5)",
                fontSize: "13px",
                marginRight: "12px",
                marginBottom: "100px",
              }}
            >
              {time}
            </p>
          ) : (
            <p
              style={{
                alignSelf: "flex-end",
                color: "rgba(0,0,0,0.5)",
                fontSize: "13px",
                marginRight: "12px",
              }}
            >
              {time}
            </p>
          )}
        </>
      );
    } else {
      return (
        <>
          <div style={style2}>
            <p className="message_sent">{message}</p>
          </div>
          {isLast ? (
            <p
              style={{
                color: "rgba(0,0,0,0.5)",
                fontSize: "13px",
                marginLeft: "12px",
                marginBottom: "100px",
              }}
            >
              {/* {isSeen ? (
                <p style={{ color: "blue" }}>&#10003;&#x2713;</p>
              ) : (
                <p>&#10003;&#x2713;</p>
              )} */}
              {time}
            </p>
          ) : (
            <p
              style={{
                color: "rgba(0,0,0,0.5)",
                fontSize: "13px",
                marginLeft: "12px",
              }}
            >
              {time}
            </p>
          )}
        </>
      );
    }
  };
  return rendering();
};

export default MessCard;
