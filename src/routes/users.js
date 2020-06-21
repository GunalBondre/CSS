const express = require("express");
const router = express.Router();
const USer = require("../models/users");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crypto = require("crypto");
const { ensureAuthenticated } = require("../models/auth");
const { LoggedIn } = require("../models/auth");
const Nexmo = require("nexmo");
var nodemailer = require("nodemailer");

const nexmo = new Nexmo({
  apiKey: "1d5a96be",
  apiSecret: "zRAxmYIvV0aDBDWV",
});

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
router.get("/otpsignin", LoggedIn, (req, res) => {
  res.render("otpsignin");
});
router.get("/otpVerifyPass", LoggedIn, (req, res) => {
  res.render("otpVerifyPass");
});
router.get("/forgotPass", (req, res) => {
  res.render("forgotPass");
});
router.get("/resetPass", (req, res) => {
  res.render("resetPass");
});
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

router.post("/otpsignin", (req, res) => {
  var number = req.body.mobile;
  USer.findOne({ number: number }).then((user) => {
    if (user) {
      const token = crypto.randomBytes(20).toString("hex");
      user.update({
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
      });
    }
  });

  nexmo.verify.request(
    { number: number, brand: "Awesome Company" },
    (err, result) => {
      if (err) {
        res.sendStatus(500);
      } else {
        let requestId = result.request_id;
        if (result.status == "0") {
          res.render("otpsignin", { requestId: requestId }); // Success! Now, have your user enter the PIN
        } else {
          res.status(401).send(result.error_text);
        }
      }
    }
  );
});

router.post("/welcome", (req, res) => {
  let pin = req.body.pin;
  let requestId = req.body.requestId;

  nexmo.verify.check(
    {
      request_id: requestId,
      code: pin,
    },
    (err, result) => {
      if (err) {
        //res.status(500).send(err);
        res.render("otpsignin", {
          message: "Server Error",
        });
      } else {
        console.log(result);
        // Error status code: https://developer.nexmo.com/api/verify#verify-check
        if (result && result.status == "0") {
          USer.findOne({ resetPasswordToken: req.params.token }).then(
            (user) => {
              user.isVerified = true;
              console.log(user.isVerified);
              user.save().then((User) => {
                req.flash("success_msg");
                res.render("welcome", {
                  message: "Account verified! 🎉",
                });
              });
            }
          );

          //res.status(200).send('Account verified!');
          // res.render("welcome", {
          //   message: "Account verified! 🎉",
          // });
        } else {
          //res.status(401).send(result.error_text);
          res.render("otpsignin", {
            message: result.error_text,
            requestId: requestId,
          });
        }
      }
    }
  );
});

router.post("/forgotPass", (req, res) => {
  // res.render("forgotPass");

  const { email } = req.body;

  USer.findOne({ email: email }).then((user) => {
    if (!user) {
      req.flash("error_msg", "Email id does not exist");
      res.redirect("/users/forgotPass");
    }
    if (user) {
      const number = user.phone;
      const token = crypto.randomBytes(20).toString("hex");
      user.update({
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
      });

      nexmo.verify.request(
        { number: number, brand: "Awesome Company" },
        (err, result) => {
          if (err) {
            res.sendStatus(500);
          } else {
            let requestId = result.request_id;
            if (result.status == "0") {
              res.render("otpVerifyPass", { requestId: requestId }); // Success! Now, have your user enter the PIN
            } else {
              res.status(401).send(result.error_text);
            }
          }
        }
      );
    }
  });
});

router.post("/otpVerifyPass", (req, res) => {
  let pin = req.body.pin;
  let requestId = req.body.requestId;

  nexmo.verify.check(
    {
      request_id: requestId,
      code: pin,
    },
    (err, result) => {
      if (err) {
        //res.status(500).send(err);
        res.render("otpVerifyPass", {
          message: "Server Error",
        });
      } else {
        console.log(result);
        // Error status code: https://developer.nexmo.com/api/verify#verify-check
        if (result && result.status == "0") {
          //res.status(200).send('Account verified!');
          res.render("resetPass", {});
        } else {
          //res.status(401).send(result.error_text);
          res.render("otpVerifyPass", {
            message: result.error_text,
            requestId: requestId,
          });
        }
      }
    }
  );
});

router.post("/resetPass", (req, res) => {
  USer.findOne({ resetPasswordToken: req.params.token }).then((user) => {
    if (user) {
      user.password = req.body.password;
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user
            .save()
            .then((User) => {
              req.flash("success_msg", "Password Reset SuccessFull");
              res.redirect("/users/emailsignin");
            })
            .catch((err) => console.log(err));
        })
      );
    }
  });
});

router.get("/resetPass/:token", (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgotPass");
      }
      res.render("resetPass", {
        user: req.user,
      });
    }
  );
});

module.exports = router;
