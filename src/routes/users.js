const express = require("express");
const router = express.Router();

// signin page

router.get("/signin", (req, res) => {
  res.render("signin");
});

// register

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/emailsignin", (req, res) => {
  res.render("emailsignin");
});
module.exports = router;
