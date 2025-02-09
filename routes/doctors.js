const express = require("express");
const { getDoctors, getDoctor } = require("../controllers/doctors");
const { createDoctor } = require("../controllers/doctors");
const { deleteDoctor } = require("../controllers/doctors");

// const User = require("../models/User");

const router = express.Router();

// const advancedResults = require("../middleware/advancedResults");
// const { protect, authorize } = require("../middleware/auth");

// router.use(protect);
// router.use(authorize("admin"));

router.route("/").get(getDoctors).post(createDoctor);

router.route("/:id").get(getDoctor).delete(deleteDoctor);

module.exports = router;
