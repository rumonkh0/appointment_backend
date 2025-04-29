const express = require("express");
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointments");

const Appointment = require("../models/Appointment");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// Protect all routes
router.use(protect);

// Routes for appointments
router
  .route("/")
  .get(
    advancedResults(Appointment, {
      path: "doctor",
      select: "name specialization hospital image fee",
    }),
    getAppointments
  ) // Populate doctor details in advanced results
  .post(authorize("admin", "staff"), createAppointment); // Restrict creation to admin or staff roles

router
  .route("/:id")
  .get(getAppointment)
  .put(authorize("admin", "staff"), updateAppointment) // Restrict updates to admin or staff roles
  .delete(authorize("admin"), deleteAppointment); // Restrict deletion to admin role

module.exports = router;
