const mongoose = require("mongoose");

const slotBookingSchema = new mongoose.Schema({
  startTime: [{ type: String }],
  endtime: { type: String },
  isBooked: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  slots: { type: mongoose.Schema.Types.ObjectId, ref: "slot" },
  docdetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  bookedBy: {
    type: String,
  },
});

const subSlotBooking = mongoose.model("subSlotBooking", slotBookingSchema);
module.exports = subSlotBooking;
