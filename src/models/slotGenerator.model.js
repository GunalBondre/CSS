const mongoose = require("mongoose");
const { mongo } = require("mongoose");
const subSlotBooking = require("../models/slotBooking.model");

const slotSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    docdetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    dayselect: {
      type: String,
    },
    selecthospital: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endtime: {
      type: String,
    },
    interval: {
      type: String,
    },
    timeSlotWithInterval: [
      {
        type: String,
      },
    ],
  },
  { timestamps: {} }
);
slotSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  subSlotBooking.remove({ slots: this._id }).exec();
  next();
});
const slot = mongoose.model("slot", slotSchema);

module.exports = slot;
