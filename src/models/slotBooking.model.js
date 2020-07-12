const mongoose = require("mongoose");

const slotBookingSchema = new mongoose.Schema({
  startTime: { type: String },
  endtime: { type: String },
  isBooked: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
});

const slotBooking = mongoose.model("slotBooking", slotBookingSchema);
module.exports = {
  slotBooking: slotBooking,
  slotBookingSchema: slotBookingSchema,
};
