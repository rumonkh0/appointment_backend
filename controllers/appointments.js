const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Appointment = require('../models/Appointment');

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
  const appointment = await Appointment.findById(req.params.id);

  if(!appointment){
    return next(new ErrorResponse(`No appointment with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Create appointment
// @route     POST /api/v1/appointments
// @access    Private/Admin
exports.createAppointment = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;
  //todo
  //need to check any appointments in the same slot
  const appointment = await Appointment.create(req.body);

  res.status(201).json({
    success: true,
    data: appointment
  });
});

// @desc      Update appointment
// @route     PUT /api/v1/appointments/:id
// @access    Private/Admin
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Delete appointment
// @route     DELETE /api/v1/appointments/:id
// @access    Private/Admin
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  await Appointment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
