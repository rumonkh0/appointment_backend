const express = require("express");
const {
  getDoctors,
  getDoctor,
  editDoctor,
  createDoctor,
  deleteDoctor,
  getDoctorsBySpecialization,
  getDoctorsByLocation,
  doctorPhotoUpload,
  getDoctorChambers,
  getDoctorChamberByIndex
} = require("../controllers/doctors");
const reviewRouter = require("./reviews");

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use("/:doctorId/reviews", reviewRouter);

// Public routes
router.route("/")
  .get(getDoctors)
  .post(createDoctor);

// Routes that should be defined BEFORE parameterized routes to avoid conflicts
router.route("/specialization/:specialization")
  .get(getDoctorsBySpecialization);

router.route("/location/:location")
  .get(getDoctorsByLocation);

// Get specific doctor and operations on it
router.route("/:id")
  .get(getDoctor)
  .put(editDoctor)
  .delete(deleteDoctor);

// Get all chambers for a doctor
router.route("/:id/chambers")
  .get(getDoctorChambers);

// Get specific chamber by index for a doctor
router.route("/:id/chambers/:chamberIndex")
  .get(getDoctorChamberByIndex);

// Upload doctor photo route
router.route("/:id/photo")
  .put(doctorPhotoUpload);

module.exports = router;
