const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    fromLocation: {
      type: String,
      required: [true, "Please provide pickup location"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Please provide destination"],
      trim: true,
    },
    ambulanceType: {
      type: String,
      required: [true, "Please specify ambulance type"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Please provide booking date"],
    },
    name: {
      type: String,
      required: [true, "Please provide patient/contact name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a contact phone number"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ambulance", ambulanceSchema);
