const mongoose = require("mongoose");
const docSchema = require("../models/doctor.model").model("Doctor").schema;
var deepPopulate = require("mongoose-deep-populate")(mongoose);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    select: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "user", "doctor"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    docdetail: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
  { timestamps: {} }
);

UserSchema.virtual("slots", {
  ref: "slot",
  foreignField: "docdetail",
  localField: "_id",
});

UserSchema.plugin(deepPopulate);

const User = mongoose.model("User", UserSchema);

module.exports = User;
