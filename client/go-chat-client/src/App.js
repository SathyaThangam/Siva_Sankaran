import React from "react";

import "./App.scss";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Chats from "./screens/Chats";
import Messages from "./screens/Messages";
import Video from "./screens/Video";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route path="/" exact component={Register} />
          <Route path="/login" exact component={Login} />
          <Route path="/chats" exact component={Chats} />
          <Route path="/chats/messages" exact component={Messages} />
          <Route path="/video" exact component={Video} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
