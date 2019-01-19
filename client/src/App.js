import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import { Provider } from "react-redux";
import store from "./store";
import { SET_CURRENT_USER } from "./actions/types";
import setAuthToken from "./utils/setAuthToken";
import jwt_decode from "jwt-decode";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";

import "./App.css";
import { setCurrentUser } from "./actions/authActions";

if (localStorage.jwtToken) {
  // Set token to Auth header
  setAuthToken(localStorage.jwtToken);

  // Decode token to get user data
  const decoded = jwt_decode(localStorage.jwtToken);

  // Set the current user information into Redux state
  store.dispatch(setCurrentUser(decoded));
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
