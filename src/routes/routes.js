const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/doctors", (req, res) => {
  res.render("doctors");
});

router.get("/hospitals", (req, res) => {
  res.render("hospitals");
});

module.exports = router;
