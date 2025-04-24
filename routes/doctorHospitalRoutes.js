const express = require("express");
const {
  assignDoctorToHospital,
  removeDoctorFromHospital,
  getHospitalDoctors,
  getDoctorHospitals,
  setDoctorAvailability,
  getDoctorAvailableSlots,
} = require("../controllers/doctorHospitalController");

// Middleware
const { protect, authorize } = require("../middleware/auth");

// Initialize router
const router = express.Router();

// Routes for hospital-doctor associations
router
  .route("/hospitals/:hospitalId/doctors/:doctorId")
  .post(protect, authorize("admin"), assignDoctorToHospital)
  .delete(protect, authorize("admin"), removeDoctorFromHospital);

// Get all doctors of a hospital
router.route("/hospitals/:hospitalId/doctors").get(getHospitalDoctors);

// Get all hospitals of a doctor
router.route("/doctors/:doctorId/hospitals").get(getDoctorHospitals);

// Set doctor availability at a hospital
router
  .route("/doctors/:doctorId/availability")
  .post(protect, authorize("admin", "doctor"), setDoctorAvailability);

// Get available time slots for a doctor
router.route("/doctors/:doctorId/slots").get(getDoctorAvailableSlots);

module.exports = router;
