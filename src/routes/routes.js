const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../models/auth");

router.get("/", (req, res) => {
  res.render("index", { success_msg: req.flash("success_msg") });
});

router.get("/doctors", ensureAuthenticated, (req, res) => {
  res.render("doctors");
});

// test route
router.get("/HIW", (req, res) => {
  res.render("HIW");
});

router.get("/hospitals", ensureAuthenticated, (req, res) => {
  res.render("hospitals");
});
router.get("/contactUs", ensureAuthenticated, (req, res) => {
  res.render("contactUs");
});

router.get("/treatment", ensureAuthenticated, (req, res) => {
  res.render("treatment");
});

router.get("/appointment", (req, res) => {
  res.render("appointment");
});
router.post("/appointment", (req, res) => {
  res.render("appointment");
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

router.get("/docprofile", (req, res) => {
  res.render("docprofile");
});

router.get("/abouthospital", (req, res) => {
  res.render("abouthospital");
});
router.get("/faq", (req, res) => {
  res.render("faq");
});
router.get("/query", (req, res) => {
  res.render("query");
});
router.post("/query", (req, res) => {
  res.render("query");
});

router.get("/tvstra-plus", (req, res) => {
  res.render("tvstra-plus");
});

module.exports = router;
