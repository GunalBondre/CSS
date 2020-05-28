const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mainRoutes = require("./src/routes/routes");
const userRoutes = require("./src/routes/users");
const TWO_HOUR = 1000 * 60 * 60 * 2;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true })); //Line3
app.use(bodyParser.json()); //Line4

app.set("views", __dirname + "/src/view/");

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/src/public/images/")));
app.use(express.static(path.join(__dirname, "/src/public/css/")));
app.use(express.static(path.join(__dirname, "/src/public/js/")));

app.use(cookieParser());

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "ninadisaqws",
    cookie: {
      maxAge: TWO_HOUR,
      sameSite: true,
    },
  })
);
app.use(function (req, res, next) {
  res.locals.user_id = req.session.user_id;
  res.locals.email = req.session.email;

  next();
});

app.use("/", mainRoutes);
app.use("/users", userRoutes);

app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"), () => {
  console.log("application running on port", +app.get("port"));
});

module.exports = app;
