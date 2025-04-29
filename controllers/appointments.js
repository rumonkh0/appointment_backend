const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor'); // Import Doctor model

// @desc      Get all appointments
// @route     GET /api/v1/appointments
// @access    Private/Admin
exports.getAppointments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single appointment
// @route     GET /api/v1/appointments/:id
// @access    Private/Admin
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id).populate({
    path: 'doctor',
    select: 'name specialization hospital image fee',
  });

  if (!appointment) {
    return next(new ErrorResponse(`No appointment with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

// @desc      Create appointment
// @route     POST /api/v1/appointments
// @access    Private/Admin
exports.createAppointment = asyncHandler(async (req, res, next) => {
  // Ensure the doctor exists
  const doctor = await Doctor.findById(req.body.doctor);
  if (!doctor) {
    return next(new ErrorResponse(`No doctor found with the id of ${req.body.doctor}`, 404));
  }

  req.body.userId = req.user.id;

  // TODO: Check for conflicting appointments in the same slot
  const appointment = await Appointment.create(req.body);

  res.status(201).json({
    success: true,
    data: appointment,
  });
});

// @desc      Update appointment
// @route     PUT /api/v1/appointments/:id
// @access    Private/Admin
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  // Ensure the doctor exists if doctor is being updated
  if (req.body.doctor) {
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return next(new ErrorResponse(`No doctor found with the id of ${req.body.doctor}`, 404));
    }
  }

  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'doctor',
    select: 'name specialization hospital image fee',
  });

  if (!appointment) {
    return next(new ErrorResponse(`No appointment with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

// @desc      Delete appointment
// @route     DELETE /api/v1/appointments/:id
// @access    Private/Admin
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`No appointment with the id of ${req.params.id}`, 404));
  }

  await appointment.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});