const express = require("express");
const {
  getDoctors,
  getDoctor,
  editDoctor,
  createDoctor,
  deleteDoctor,
} = require("../controllers/doctors");
const reviewRouter = require("./reviews");

// const User = require("../models/User");

const router = express.Router({ mergeParams: true });

// const advancedResults = require("../middleware/advancedResults");
// const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:doctorId/reviews", reviewRouter);

// router.use(protect);
// router.use(authorize("admin"));

router.route("/").get(getDoctors).post(createDoctor);

router.route("/:id").get(getDoctor).delete(deleteDoctor).put(editDoctor);

module.exports = router;
