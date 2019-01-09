const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

//Routes for Users, Profile and Posts
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

//DB Config
const db = require("./config/keys").mongoURI;

//Connecting to mongoDB
mongoose
  .connect(db)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello !!!"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
