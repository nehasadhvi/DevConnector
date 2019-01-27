import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import setAuthToken from "./utils/setAuthToken";
import jwt_decode from "jwt-decode";

import "./App.css";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import { clearCurrentProfile } from "./actions/profileActions";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import CreateProfile from "./components/create-profile/CreateProfile";
import PrivateRoute from "./components/commons/PrivateRoute";

if (localStorage.jwtToken) {
  // Set token to Auth header
  setAuthToken(localStorage.jwtToken);

  // Decode token to get user data
  const decoded = jwt_decode(localStorage.jwtToken);

  // Set the current user information into Redux state
  store.dispatch(setCurrentUser(decoded));

  // Get the current time
  const currentTime = Date.now() / 1000;
  // Check for expired token
  if (currentTime > decoded.exp) {
    // Clear User Profile
    store.dispatch(clearCurrentProfile());
    // Logout User
    store.dispatch(logoutUser());

    // Redirect user to login page
    window.location.href = "/login";
  }
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
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
              </Switch>
              <Switch>
                <PrivateRoute
                  exact
                  path="/create-profile"
                  component={CreateProfile}
                />
              </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
