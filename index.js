require("./src/models/db");

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
const passport = require("passport");
require("./src/models/passport")(passport);
const flash = require("connect-flash");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const methodOverride = require("method-override");

const cors = require("cors");
app.use(cors());

app.set("views", __dirname + "/src/view/");

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/src/public/images/")));
app.use(express.static(path.join(__dirname, "/src/public/css/")));
app.use(express.static(path.join(__dirname, "/src/public/js/")));
app.use(express.static(path.join(__dirname, "/src/public/font/")));
app.use(express.static(path.join(__dirname, "/src/public/uploads/")));
app.use(express.static(path.join(__dirname, "uploads")));

app.use(cookieParser(""));

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

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.requestId = req.requestId;
  res.locals.isVerified = req.session.isVerified;
  res.locals.otp = req.session.isVerified;
  res.locals.name = req.session.name;
  res.locals.doc_details = req.session.docdetails;
  res.locals.role = req.session.role;
  res.locals.currentUser = req.user;
  res.locals.slot_id = req.session.slotId;
  res.locals.location = req.session.location;
  next();
});
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("succsss_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});
app.use(methodOverride("_method"));

app.use("/", mainRoutes);
app.use("/users", userRoutes);

app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"), () => {
  console.log("application running on port", +app.get("port"));
});

module.exports = app;
