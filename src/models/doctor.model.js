const mongoose = require("mongoose");
const userSchema = require("../models/users");
const slotSchema = require("../models/slotGenerator.model");
var mongoosePaginate = require("mongoose-paginate");

const DocSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
    },
    name: {
      type: String,
    },
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
    slots: { type: mongoose.Schema.Types.ObjectId, ref: "slot" },
    experience: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: {} }
);
// DocSchema.virtual("slots", {
//   ref: "slot",
//   foreignField: "createdBy",
//   localField: "_id",
// });

const Doctor = mongoose.model("Doctor", DocSchema);

module.exports = Doctor;
