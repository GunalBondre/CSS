const mongoose = require("mongoose");
const { mongo } = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

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
slotSchema.plugin(mongoosePaginate);

const slot = mongoose.model("slot", slotSchema);

module.exports = slot;
