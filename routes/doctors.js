const express = require("express");
const {
  getDoctors,
  getDoctor,
  editDoctor,
  createDoctor,
  deleteDoctor,
  getDoctorsBySpecialization,
  updateAvailability,
  doctorPhotoUpload,
  getAvailableSlots
} = require("../controllers/doctors");
const reviewRouter = require("./reviews");

// const User = require("../models/User");

const router = express.Router({ mergeParams: true });

// const advancedResults = require("../middleware/advancedResults");
// const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:doctorId/reviews", reviewRouter);

// Public routes
router.route("/")
  .get(getDoctors);

router.route("/:id")
  .get(getDoctor);

router.route("/specialization/:specialization")
  .get(getDoctorsBySpecialization);

// Get available time slots for a doctor
router.route("/:id/available-slots")
  .get(getAvailableSlots);

// Routes that require authentication
// Protect all routes after this middleware
// router.use(protect);

// Create doctor route - Protected
router.route("/")
  .post(
    // authorize("admin"), 
    createDoctor
  );

// Edit/delete doctor routes - Protected
router.route("/:id")
  .put(
    // authorize("admin"), 
    editDoctor
  )
  .delete(
    // authorize("admin"), 
    deleteDoctor
  );

// Update doctor availability route - Protected
router.route("/:id/availability")
  .patch(
    // authorize("admin"), 
    updateAvailability
  );

// Upload doctor photo route - Protected
router.route("/:id/photo")
  .put(
    // authorize("admin"), 
    doctorPhotoUpload
  );

module.exports = router;
