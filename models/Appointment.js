const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide patient name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a contact phone number"],
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // Association with Doctor model
      required: [true, "Please select a doctor"],
    },
    chamber: {
      type: String,
      required: [true, "Please provide chamber information"],
      trim: true,
    },
    consultationType: {
      type: String,
      enum: ["Face to Face", "Video", "Phone", "Home Visit"],
      default: "Face to Face",
      required: [true, "Please specify consultation type"],
    },
    appointmentType: {
      type: String,
      enum: ["New Patient", "Follow Up", "Emergency", "Regular Checkup"],
      default: "New Patient",
      required: [true, "Please specify appointment type"],
    },
    date: {
      type: Date,
      required: [true, "Please provide appointment date"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled", "No Show"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate doctor information when fetching appointments
appointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "doctor",
    select: "name specialization hospital image fee",
  });
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);