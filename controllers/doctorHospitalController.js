const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Assign a doctor to a hospital
// @route   POST /api/v1/hospitals/:hospitalId/doctors/:doctorId
// @access  Private/Admin
exports.assignDoctorToHospital = asyncHandler(async (req, res, next) => {
  const { hospitalId, doctorId } = req.params;

  // Check if hospital and doctor exist
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return next(
      new ErrorResponse(`Hospital not found with id of ${hospitalId}`, 404)
    );
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // Assign doctor to hospital
  await hospital.assignDoctor(doctorId);

  // Add hospital to doctor's hospitals list
  await doctor.addHospital(hospitalId);

  res.status(200).json({
    success: true,
    data: {
      message: `Doctor ${doctor.name} assigned to ${hospital.name}`,
      hospital: hospital.name,
      doctor: doctor.name,
    },
  });
});

// @desc    Remove a doctor from a hospital
// @route   DELETE /api/v1/hospitals/:hospitalId/doctors/:doctorId
// @access  Private/Admin
exports.removeDoctorFromHospital = asyncHandler(async (req, res, next) => {
  const { hospitalId, doctorId } = req.params;

  // Check if hospital and doctor exist
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return next(
      new ErrorResponse(`Hospital not found with id of ${hospitalId}`, 404)
    );
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // Remove doctor from hospital
  await hospital.removeDoctor(doctorId);

  // Remove hospital from doctor's hospitals list
  await doctor.removeHospital(hospitalId);

  res.status(200).json({
    success: true,
    data: {
      message: `Doctor ${doctor.name} removed from ${hospital.name}`,
    },
  });
});

// @desc    Get all doctors of a hospital
// @route   GET /api/v1/hospitals/:hospitalId/doctors
// @access  Public
exports.getHospitalDoctors = asyncHandler(async (req, res, next) => {
  const { hospitalId } = req.params;

  // Check if hospital exists
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return next(
      new ErrorResponse(`Hospital not found with id of ${hospitalId}`, 404)
    );
  }

  // Get doctors of this hospital
  const doctors = await Doctor.findByHospital(hospitalId);

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc    Get all hospitals of a doctor
// @route   GET /api/v1/doctors/:doctorId/hospitals
// @access  Public
exports.getDoctorHospitals = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;

  // Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // Get hospitals of this doctor
  await doctor.populate("hospitals", "name address location contactInfo");

  res.status(200).json({
    success: true,
    count: doctor.hospitals.length,
    data: doctor.hospitals,
  });
});

// @desc    Set doctor availability at a hospital
// @route   POST /api/v1/doctors/:doctorId/availability
// @access  Private/Admin/Doctor
exports.setDoctorAvailability = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const availabilityData = req.body;

  // Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // Check if doctor is associated with the hospital
  if (!doctor.hospitals.includes(availabilityData.hospital)) {
    return next(
      new ErrorResponse(
        `Doctor is not associated with hospital ID ${availabilityData.hospital}`,
        400
      )
    );
  }

  try {
    // Add availability
    await doctor.addAvailability(availabilityData);

    res.status(200).json({
      success: true,
      data: doctor.availability,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Get available time slots for a doctor
// @route   GET /api/v1/doctors/:doctorId/slots?date=YYYY-MM-DD&hospital=hospitalId
// @access  Public
exports.getDoctorAvailableSlots = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date, hospital } = req.query;

  if (!date) {
    return next(new ErrorResponse("Please provide a date", 400));
  }

  // Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // Get available slots
  const availableSlots = doctor.getAvailableSlots(date, hospital);

  res.status(200).json({
    success: true,
    count: availableSlots.length,
    data: availableSlots,
  });
});
