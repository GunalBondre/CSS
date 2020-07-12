const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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
    bookingDate: { type: Date },
  },
  { timestamps: {} }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
