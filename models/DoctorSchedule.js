const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,        },
        timeSlots: [
          {
            slot: {
              type: String, // Example: "10:00 AM - 11:00 AM"
              required: true,
            },
            maxPatients: {
              type: Number,
              required: true,
              min: 1,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
