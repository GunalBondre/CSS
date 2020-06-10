const express = require("express");
const router = express.Router();
const USer = require("../models/users");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../models/auth");
const { LoggedIn } = require("../models/auth");
var messageBird = require("messagebird")("6mBHPkoxuvhpoltiAIhuqMyCJ");
// signin page

router.get("/signin", LoggedIn, (req, res) => {
  res.render("signin");
});

// register

router.get("/signup", LoggedIn, (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  const { name, email, password, select, date, phone, city, state } = req.body;

  let errors = [];
  //check req fields

  if (
    !name ||
    !email ||
    !password ||
    !select ||
    !date ||
    !phone ||
    !city ||
    !state
  ) {
    errors.push({ msg: "please fill all details" });
  }
  // check pass length
  if (password.length < 6) {
    errors.push({ msg: "password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("signup", {
      errors,
      name,
      email,
      password,
    });
  } else {
    USer.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "email is already register" });
        //user exost
        res.render("signup", {
          errors,
          name,
          email,
          password,
        });
      } else {
        const newUser = new USer({
          name,
          email,
          password,
          select,
          date,
          phone,
          city,
          state,
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "you are now registered and can login"
                );
                res.redirect("/users/emailsignin");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.post("/emailsignin", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/emailsignin",
    failureFlash: true,
  })(req, res, next);
});

router.get("/emailsignin", LoggedIn, (req, res) => {
  res.render("emailsignin");
});

router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

router.post("/otpsignin", (req, res) => {
  var number = req.body.mobile;
  messageBird.verify.create(
    number,
    {
      template: "Your verification code is %token",
    },
    (err, response) => {
      if (err) {
        console.log(err);
        res.render("signin", {
          error: err.errors[0].description,
        });
      } else {
        console.log(response);
        res.render("otpsignin", {
          id: res.id,
        });
      }
    }
  );
});

router.post("/welcome", (req, res) => {
  var id = req.body.id;
  var token = req.body.token;
  messageBird.verify.verify(id, token, (err, response) => {
    if (err) {
      res.render("otpsignin", {
        error: err.errors[0].description,
        id: id,
      });
    } else {
      console.log(response);
      res.render("welcome", {
        id: id,
      });
    }
  });
});
module.exports = router;
