const Doctor = require("../models/Doctor");
const asyncHandler = require("../middleware/async");

// @desc      Get all doctors
// @route     GET /api/v1/doctors
// @access    Public
exports.getDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.find();
  res.status(200).json({ success: true, data: doctors });
  //   res.status(200).json(res.advancedResults);
});

// @desc      Get single doctor
// @route     GET /api/v1/doctors/:id
// @access    Public
exports.getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: doctor });
});

// @desc      Create new doctor
// @route     POST /api/v1/doctors
// @access    Private
exports.createDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    success: true,
    data: doctor,
  });
});

// @desc      Delete doctor
// @route     DELETE /api/v1/doctors/:id
// @access    Private
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  await doctor.deleteOne()

  res
    .status(200)
    .json({ success: true, message: "Doctor removed successfully" });
});
