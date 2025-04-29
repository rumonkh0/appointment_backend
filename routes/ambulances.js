const express = require("express");
const {
  getAmbulances,
  getAmbulance,
  createAmbulance,
  updateAmbulance,
  deleteAmbulance,
} = require("../controllers/ambulances");

const Ambulance = require("../models/Ambulance");

const router = express.Router();

// Middleware
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

// Public routes for getting ambulances
router.route("/")
  .get(advancedResults(Ambulance), getAmbulances);

router.route("/:id")
  .get(getAmbulance);

// Protected routes - require authentication
router.use(protect);

// Admin only routes
router.use(authorize("admin"));

router.route("/")
  .post(createAmbulance);

router.route("/:id")
  .put(updateAmbulance)
  .delete(deleteAmbulance);

module.exports = router;
