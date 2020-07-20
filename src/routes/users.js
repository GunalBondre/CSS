const express = require("express");
const router = express.Router();
const USer = require("../models/users");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crypto = require("crypto");
const { ensureAuthenticated } = require("../models/auth");
const mongoose = require("mongoose");
const { LoggedIn } = require("../models/auth");
const Nexmo = require("nexmo");
var moment = require("moment");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
var nodemailer = require("nodemailer");
const toastr = require("toastr");
const doc = require("../models/doctor.model");
const methodOverride = require("method-override");
const { model } = require("../models/doctor.model");
const User = require("../models/users");
const ObjectId = require("mongodb").ObjectID;
require("../models/passport");
const booking = require("../models/appointment.model");
const subSlotBooking = require("../models/slotBooking.model");
const nexmo = new Nexmo({
  apiKey: "1d5a96be",
  apiSecret: "zRAxmYIvV0aDBDWV",
});
var passwordValidator = require("password-validator");
var schema = new passwordValidator();

// Add properties to it
schema
  .is()
  .min(6) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values
// signin page

router.get("/signin", LoggedIn, (req, res) => {
  res.render("signin", { message: req.flash("message") });
});

router.get("/doctorDetails", ensureAuthenticated, (req, res) => {
  const createdBy = ObjectId(req.session.passport.user._id);
  doc.findOne({ createdBy: createdBy }).then((user) => {
    if (user) {
      res.redirect("/");
    } else {
      res.render("doctorDetails", {
        success_message: req.flash("success_msg"),
      });
    }
  });
});
// register

router.get("/signup", LoggedIn, (req, res) => {
  res.render("signup", { success_message: req.flash("success_msg") });
});

router.post("/signup", (req, res) => {
  const { name, email, password, select, date, phone, city, state } = req.body;
  const role = req.body.isDoctor ? "doctor" : "user";

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
  if (!schema.validate(password)) {
    errors.push({
      msg:
        "Please match the pattern one uppercase,one lowercase, minimum 6 digits, no spaces",
    });
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
          role,
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
  USer.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      req.flash("error_msg", "email is not registered please signup");
      res.redirect("/users/signup");
    }
    if (user) {
      if (user.role === "doctor") {
        passport.authenticate("local", {
          successRedirect: "/users/doctorDetails",
          failureRedirect: "/users/emailsignin",
          failureFlash: true,
          successFlash: true,
        })(req, res, next);
      } else {
        req.session.name = user.name;
        passport.authenticate("local", {
          successRedirect: "/",
          success_msg: req.flash("success_msg", "successfully logged in"),
          failureRedirect: "/users/emailsignin",
          error_msg: req.flash("error_msg", "password or email is wrong"),
          failureFlash: true,

          // successFlash: "Welcome!",
        })(req, res, next);
      }
    }
  });
});

router.get("/emailsignin", LoggedIn, (req, res) => {
  res.render("emailsignin", {
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    message: req.flash("message"),
  });
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
              req.session.isVerified = user.isVerified;
              console.log(req.session.isVerified);
              const otp = req.session.isVerified;
              console.log(otp);
              user.save().then((User) => {
                req.flash("success_msg");
                res.render("welcome", {
                  message: "Account verified! 🎉",
                  success_msg: req.flash(
                    "success_msg",
                    "successfully logged in"
                  ),

                  otp: otp,
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

router.post(
  "/doctorDetails",
  upload.single("avatar"),
  ensureAuthenticated,
  async (req, res) => {
    console.log(req.file);
    const _id = ObjectId(req.session.passport.user._id);
    const slot = req.session.slot_id;
    const user = await USer.findById(_id);
    const {
      bio,
      speciality,
      education,
      treatment,
      location,
      hospitalList,
      achievement,
      awards,
      experience,
      fee,
    } = req.body;
    const avatar = req.file.filename;
    let errors = [];
    //check req fields

    if (
      !bio ||
      !speciality ||
      !education ||
      !treatment ||
      !location ||
      !hospitalList ||
      !experience ||
      !fee
    ) {
      errors.push({ msg: "please fill all details" });
    }
    if (errors.length > 0) {
      res.render("doctorDetails", {
        errors,
        bio,
        speciality,
        education,
        treatment,
        location,
        hospitalList,
      });
    } else {
      const newDoc = new doc({
        name: user.name,
        createdBy: _id,
        slot: slot,
        bio,
        speciality,
        education,
        treatment,
        location,
        hospitalList,
        achievement,
        awards,
        avatar: avatar,
        fee,
        experience,
      });
      newDoc.save().then((docdetails) => {
        if (docdetails) {
          req.session.doc_id = docdetails._id;
          console.log(req.session.doc_id);
          req.flash("success_msg", "Details saved successfully");
          res.redirect("/");
        }
      });
    }
  }
);

// Dashboard get routes

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const _id = ObjectId(req.session.passport.user._id);
  USer.findOne({ _id: _id }).then((user) => {
    if (user) {
      res.render("dashboard", { user: req.user, role: user.role });
    }
  });
});

// Dashboard post routes

router.post("/dashboard", (req, res) => {
  res.render("dashboard");
});

// router.post("/doctor-profile", (req, res) => {
//   res.render("doctor-profile");
// });

// profile get route
router.get(
  "/profile",
  upload.single("avatar"),
  ensureAuthenticated,
  (req, res) => {
    const _id = ObjectId(req.session.passport.user._id);

    USer.findOne({ _id: _id })
      .then((user, err) => {
        if (user) {
          res.render("profile", {
            name: user.name,
            phone: user.phone,
            email: user.email,
            select: user.select,
            dob: user.date,
            city: user.city,
            state: user.state,
            user: user,
          });
        }
      })
      .catch((err) => console.log(err));
  }
);

router.post("/profile", upload.single("avatar"), (req, res) => {
  const { name, email, select, dob, phone, city, state } = req.body;
  const avatar = req.file.path;
  const _id = ObjectId(req.session.passport.user._id);

  USer.findOne({ _id: _id })
    .then((user) => {
      if (!user) {
        req.flash("error_msg", "user not found");
        res.redirect("/users/doctor-profile");
      } else {
        let changes = [];
        for (const [prop, val] of Object.entries({
          name: name,
          email: email,
          phone: phone,
          select: select,
          dob: dob,
          city: city,
          state: state,
          avatar: req.file.path,
        })) {
          if (typeof val !== "undefined") {
            console.info("changed user." + prop + " to " + val);
            user[prop] = val;
            changes.push("user." + prop + " => " + val);
          } else console.log("property " + prop + " is undefined");
        }
        user.save().then((user) => {
          console.info(
            "User '" +
              user.name +
              "' was saved successfully with " +
              changes.length +
              " changes:",
            changes
          );
          req.flash("success_msg", "details updated successfully");
          res.redirect("/users/profile");
        });
      }
    })
    .catch((err) => console.log(err));
});
router.get("/professional_profile", ensureAuthenticated, (req, res) => {
  const createdBy = ObjectId(req.session.passport.user._id);
  doc
    .findOne({ createdBy: createdBy })
    .then((user) => {
      if (user) {
        res.render("professional_profile", {
          speciality: user.speciality,
          education: user.education,
          treatment: user.treatment,
          location: user.location,
          hospitalList: user.hospitalList,
          awards: user.awards,
          fee: user.fee,
          achievements: user.achievements,
        });
      }
    })
    .catch((err) => console.log(err));
});

router.post("/professional_profile", (req, res) => {
  const {
    speciality,
    education,
    treatment,
    hospitalList,
    awards,
    achievements,
    fee,
  } = req.body;
  const createdBy = ObjectId(req.session.passport.user._id);
  doc.findOne({ createdBy: createdBy }).then((docs) => {
    if (!docs) {
      req.flash("error_msg", "details not found");
      res.redirect("/users/professional-profile");
    } else {
      let changes = [];
      for (const [prop, val] of Object.entries({
        speciality: speciality,
        education: education,
        fee: fee,
        achievements: achievements,
        awards: awards,
        hospitalList: hospitalList,
        treatment: treatment,
      })) {
        if (typeof val !== "undefined") {
          console.info("changed details of " + prop + " to " + val);
          docs[prop] = val;
          changes.push("doc." + prop + " => " + val);
        } else console.log("property " + prop + " is undefined");
      }
      docs.save().then((doc) => {
        console.log(doc);
        req.flash("success_msg", "details updated successfully");
        res.redirect("/users/professional_profile");
      });
    }
  });
});
router.get("/doctor-profile", ensureAuthenticated, (req, res) => {
  res.render("doctor-profile");
});

router.get("/upcomingAppointments", ensureAuthenticated, async (req, res) => {
  let query = [{ path: "createdBy" }, { path: "slots" }, { path: "docdetail" }];

  const email = req.session.passport.user.email;
  const id = ObjectId(req.session.passport.user._id);
  const docs = await booking.find({ patient_email: email }).populate(query);
  res.render("upcomingAppointments", {
    docs: docs,
    moment: moment,
  });
});
// profile post route

module.exports = router;
