const Hospital = require("../models/Hospital");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get hospitals within a radius
// @route   GET /api/v1/hospitals/radius/:zipcode/:distance
// @access  Public
exports.getHospitalsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  // Implement your geocoder utility or service
  const geocoder = require("../utils/geocoder");
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Radius of Earth in km is 6,371 km
  const radius = distance / 6371;

  const hospitals = await Hospital.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals,
  });
});

// @desc    Get hospitals near user's current location
// @route   GET /api/v1/hospitals/nearby
// @access  Public
exports.getNearbyHospitals = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, radius = 10, unit = "km" } = req.query;

  if (!longitude || !latitude) {
    return next(
      new ErrorResponse("Please provide longitude and latitude", 400)
    );
  }

  const hospitals = await Hospital.findHospitalsNearby(
    parseFloat(longitude),
    parseFloat(latitude),
    parseFloat(radius),
    unit
  );

  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals,
  });
});

// @desc    Get hospitals sorted by distance from user
// @route   GET /api/v1/hospitals/distance
// @access  Public
exports.getHospitalsByDistance = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, maxDistance = 10000, limit = 10 } = req.query;

  if (!longitude || !latitude) {
    return next(
      new ErrorResponse("Please provide longitude and latitude", 400)
    );
  }

  const hospitals = await Hospital.findHospitalsByDistance(
    longitude,
    latitude,
    parseFloat(maxDistance),
    parseInt(limit, 10)
  );

  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals,
  });
});
