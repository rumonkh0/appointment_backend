const express = require("express");
const {
  getHospitalsInRadius,
  getNearbyHospitals,
  getHospitalsByDistance,
} = require("../controllers/hospitalLocationController");

const router = express.Router();

// Routes for location-based hospital searches
router.get("/radius/:zipcode/:distance", getHospitalsInRadius);
router.get("/nearby", getNearbyHospitals);
router.get("/distance", getHospitalsByDistance);

module.exports = router;
