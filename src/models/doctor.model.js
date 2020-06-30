const mongoose = require("mongoose");
const userSchema = require("../models/users");

const DocSchema = new mongoose.Schema({
  bio: {
    type: String,
    required: true,
  },
  speciality: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  treatment: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  hospitalList: {
    type: String,
    required: true,
  },
  achievements: {
    type: String,
  },
  awards: {
    type: String,
  },
  fee: {
    type: String,
    required: true,
  },
  img: { data: Buffer, contentType: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Doctor = mongoose.model("Doctor", DocSchema);
module.exports = Doctor;
