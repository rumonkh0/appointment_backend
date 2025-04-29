const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Ambulance = require('../models/Ambulance');

// @desc      Get all ambulance bookings
// @route     GET /api/v1/ambulances
// @access    Public
exports.getAmbulances = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single ambulance booking
// @route     GET /api/v1/ambulances/:id
// @access    Public
exports.getAmbulance = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse(`No ambulance booking found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: ambulance,
  });
});

// @desc      Create ambulance booking
// @route     POST /api/v1/ambulances
// @access    Public
exports.createAmbulance = asyncHandler(async (req, res, next) => {
  // Validate required fields
  const requiredFields = ['fromLocation', 'destination', 'ambulanceType', 'date', 'name', 'phone'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(
      new ErrorResponse(`Please provide ${missingFields.join(', ')}`, 400)
    );
  }

  const ambulance = await Ambulance.create(req.body);

  res.status(201).json({
    success: true,
    data: ambulance,
  });
});

// @desc      Update ambulance booking
// @route     PUT /api/v1/ambulances/:id
// @access    Private/Admin
exports.updateAmbulance = asyncHandler(async (req, res, next) => {
  let ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse(`No ambulance booking found with id ${req.params.id}`, 404));
  }

  // Update ambulance
  ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: ambulance,
  });
});

// @desc      Delete ambulance booking
// @route     DELETE /api/v1/ambulances/:id
// @access    Private/Admin
exports.deleteAmbulance = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse(`No ambulance booking found with id ${req.params.id}`, 404));
  }

  await ambulance.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Update ambulance status
// @route     PATCH /api/v1/ambulances/:id/status
// @access    Private/Admin
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }

  const ambulance = await Ambulance.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ambulance) {
    return next(new ErrorResponse(`No ambulance booking found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: ambulance,
  });
});
