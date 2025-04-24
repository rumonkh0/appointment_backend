const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all chambers of a doctor
// @route   GET /api/v1/doctors/:doctorId/chambers
// @access  Public
exports.getDoctorChambers = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId).populate(
    "chambers.hospital",
    "name address location"
  );

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: doctor.chambers.length,
    data: doctor.chambers,
  });
});

// @desc    Get a specific chamber of a doctor
// @route   GET /api/v1/doctors/:doctorId/chambers/:chamberId
// @access  Public
exports.getDoctorChamber = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId } = req.params;

  const doctor = await Doctor.findById(doctorId).populate(
    "chambers.hospital",
    "name address location"
  );

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  const chamber = doctor.chambers.find((c) => c._id.toString() === chamberId);

  if (!chamber) {
    return next(
      new ErrorResponse(`Chamber not found with id of ${chamberId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: chamber,
  });
});

// @desc    Add a new chamber for a doctor
// @route   POST /api/v1/doctors/:doctorId/chambers
// @access  Private/Admin/Doctor
exports.addDoctorChamber = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const chamberData = req.body;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // Verify that hospital exists
  const hospital = await Hospital.findById(chamberData.hospital);
  if (!hospital) {
    return next(
      new ErrorResponse(
        `Hospital not found with id of ${chamberData.hospital}`,
        404
      )
    );
  }

  try {
    await doctor.addChamber(chamberData);

    res.status(201).json({
      success: true,
      data: doctor.chambers[doctor.chambers.length - 1],
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Update a doctor's chamber
// @route   PUT /api/v1/doctors/:doctorId/chambers/:chamberId
// @access  Private/Admin/Doctor
exports.updateDoctorChamber = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId } = req.params;
  const chamberData = req.body;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  // If hospital is being changed, verify it exists and doctor is associated with it
  if (chamberData.hospital) {
    const hospital = await Hospital.findById(chamberData.hospital);
    if (!hospital) {
      return next(
        new ErrorResponse(
          `Hospital not found with id of ${chamberData.hospital}`,
          404
        )
      );
    }

    const hospitalExists = doctor.hospitals.some(
      (h) => h.toString() === chamberData.hospital.toString()
    );
    if (!hospitalExists) {
      return next(
        new ErrorResponse(
          `Doctor is not associated with hospital ID ${chamberData.hospital}`,
          400
        )
      );
    }
  }

  try {
    await doctor.updateChamber(chamberId, chamberData);

    // Find the updated chamber
    const updatedChamber = doctor.chambers.find(
      (c) => c._id.toString() === chamberId
    );

    res.status(200).json({
      success: true,
      data: updatedChamber,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Delete a doctor's chamber
// @route   DELETE /api/v1/doctors/:doctorId/chambers/:chamberId
// @access  Private/Admin/Doctor
exports.deleteDoctorChamber = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId } = req.params;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  try {
    await doctor.removeChamber(chamberId);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Add availability to a doctor's chamber
// @route   POST /api/v1/doctors/:doctorId/chambers/:chamberId/availability
// @access  Private/Admin/Doctor
exports.addChamberAvailability = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId } = req.params;
  const availabilityData = req.body;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  try {
    await doctor.addChamberAvailability(chamberId, availabilityData);

    // Find the updated chamber
    const chamber = doctor.chambers.find((c) => c._id.toString() === chamberId);

    res.status(201).json({
      success: true,
      data: chamber.availability[chamber.availability.length - 1],
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Update chamber availability
// @route   PUT /api/v1/doctors/:doctorId/chambers/:chamberId/availability/:availabilityId
// @access  Private/Admin/Doctor
exports.updateChamberAvailability = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId, availabilityId } = req.params;
  const updatedData = req.body;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  try {
    await doctor.updateChamberAvailability(
      chamberId,
      availabilityId,
      updatedData
    );

    // Find the updated chamber and availability
    const chamber = doctor.chambers.find((c) => c._id.toString() === chamberId);
    const availability = chamber.availability.find(
      (a) => a._id.toString() === availabilityId
    );

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Delete chamber availability
// @route   DELETE /api/v1/doctors/:doctorId/chambers/:chamberId/availability/:availabilityId
// @access  Private/Admin/Doctor
exports.deleteChamberAvailability = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId, availabilityId } = req.params;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  try {
    await doctor.removeChamberAvailability(chamberId, availabilityId);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 400));
  }
});

// @desc    Get available slots in a specific chamber
// @route   GET /api/v1/doctors/:doctorId/chambers/:chamberId/slots?date=YYYY-MM-DD
// @access  Public
exports.getChamberAvailableSlots = asyncHandler(async (req, res, next) => {
  const { doctorId, chamberId } = req.params;
  const { date } = req.query;

  if (!date) {
    return next(new ErrorResponse("Please provide a date", 400));
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  const availableSlots = doctor.getAvailableSlotsInChamber(chamberId, date);

  res.status(200).json({
    success: true,
    count: availableSlots.length,
    data: availableSlots,
  });
});

// @desc    Get all available slots for a doctor across all chambers
// @route   GET /api/v1/doctors/:doctorId/slots?date=YYYY-MM-DD
// @access  Public
exports.getAllDoctorAvailableSlots = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return next(new ErrorResponse("Please provide a date", 400));
  }

  const doctor = await Doctor.findById(doctorId).populate(
    "chambers.hospital",
    "name address"
  );

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404)
    );
  }

  const availableSlots = doctor.getAllAvailableSlots(date);

  res.status(200).json({
    success: true,
    count: availableSlots.length,
    data: availableSlots,
  });
});

// @desc    Find available doctors in a hospital on a specific date
// @route   GET /api/v1/hospitals/:hospitalId/available-doctors?date=YYYY-MM-DD&specialization=cardiology
// @access  Public
exports.getAvailableDoctorsInHospital = asyncHandler(async (req, res, next) => {
  const { hospitalId } = req.params;
  const { date, specialization } = req.query;

  if (!date) {
    return next(new ErrorResponse("Please provide a date", 400));
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return next(
      new ErrorResponse(`Hospital not found with id of ${hospitalId}`, 404)
    );
  }

  const doctors = await Doctor.findAvailableDoctors(
    hospitalId,
    date,
    specialization
  );

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});
