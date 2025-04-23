const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/Doctors/:doctorId/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // console.log(req.params.doctorId);
  // if (req.params.doctorId) {
  //   const reviews = await Review.find({ doctor: req.params.doctorId });

  //   return res.status(200).json({
  //     success: true,
  //     count: reviews.length,
  //     data: reviews,
  //   });
  // } else {
  res.status(200).json(res.advancedResults);
  // }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "Doctor",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Add review
// @route     POST /api/v1/Doctors/:doctorId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.doctor = req.params.doctorId;
  const doctor = await Doctor.findById(req.params.doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(`No Doctor with the id of ${req.params.doctorId}`, 404)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  review.save();

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
