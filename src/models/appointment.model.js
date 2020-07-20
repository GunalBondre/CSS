const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    Date: { type: Date, default: Date.now() },
    patient_name: { type: String },
    patient_email: { type: String },
    patient_phone: { type: String, required: false },
    patient_mobile: {
      type: String,
    },
    slotTime: [{ type: String }],
    slots: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "slot",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Cancelled", "Approved", "Completed"],
      default: "Approved",
    },
    subSlots: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subSlotBooking",
    },
    docdetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { timestamps: {} }
);

const booking = mongoose.model("booking", bookingSchema);
module.exports = booking;
