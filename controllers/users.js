const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  // Validate required fields based on our updated model
  const requiredFields = ['name', 'email', 'phone', 'address', 'gender', 'birthDate'];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(
      new ErrorResponse(`Please provide ${missingFields.join(', ')}`, 400)
    );
  }
  
  // Check if user with this email already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(
      new ErrorResponse(`User already exists with email ${req.body.email}`, 400)
    );
  }
  
  // Check if user with this phone already exists
  user = await User.findOne({ phone: req.body.phone });
  if (user) {
    return next(
      new ErrorResponse(`User already exists with phone number ${req.body.phone}`, 400)
    );
  }

  // Format birthDate if it's provided as a string
  if (req.body.birthDate && typeof req.body.birthDate === 'string') {
    req.body.birthDate = new Date(req.body.birthDate);
    
    // Validate date format
    if (isNaN(req.body.birthDate.getTime())) {
      return next(
        new ErrorResponse('Invalid birth date format. Please use YYYY-MM-DD', 400)
      );
    }
  }

  // Create user
  user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
  }
  
  // Format birthDate if it's provided as a string
  if (req.body.birthDate && typeof req.body.birthDate === 'string') {
    req.body.birthDate = new Date(req.body.birthDate);
    
    // Validate date format
    if (isNaN(req.body.birthDate.getTime())) {
      return next(
        new ErrorResponse('Invalid birth date format. Please use YYYY-MM-DD', 400)
      );
    }
  }
  
  // Check if email is being changed and if it already exists
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(
        new ErrorResponse(`User already exists with email ${req.body.email}`, 400)
      );
    }
  }
  
  // Check if phone is being changed and if it already exists
  if (req.body.phone && req.body.phone !== user.phone) {
    const existingUser = await User.findOne({ phone: req.body.phone });
    if (existingUser) {
      return next(
        new ErrorResponse(`User already exists with phone number ${req.body.phone}`, 400)
      );
    }
  }
  
  // Update user
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
  }
  
  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Update user profile
// @route     PUT /api/v1/users/profile
// @access    Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Get user from req object (set by auth middleware)
  const user = await User.findById(req.user.id);
  
  // Fields allowed to be updated by the user themselves
  const allowedUpdates = ['name', 'phone', 'address', 'gender', 'birthDate'];
  
  // Create an object with only the allowed fields
  const updateData = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  
  // Format birthDate if it's provided as a string
  if (updateData.birthDate && typeof updateData.birthDate === 'string') {
    updateData.birthDate = new Date(updateData.birthDate);
    
    // Validate date format
    if (isNaN(updateData.birthDate.getTime())) {
      return next(
        new ErrorResponse('Invalid birth date format. Please use YYYY-MM-DD', 400)
      );
    }
  }
  
  // Check if phone is being changed and if it already exists
  if (updateData.phone && updateData.phone !== user.phone) {
    const existingUser = await User.findOne({ phone: updateData.phone });
    if (existingUser) {
      return next(
        new ErrorResponse(`User already exists with phone number ${updateData.phone}`, 400)
      );
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// @desc      Get current logged in user
// @route     GET /api/v1/users/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Upload user photo
// @route     PUT /api/v1/users/photo
// @access    Private
exports.uploadUserPhoto = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
  
  const file = req.files.file;
  
  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  
  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD || 1000000) { // Default to 1MB if not set
    return next(
      new ErrorResponse('Please upload an image less than 1MB', 400)
    );
  }
  
  // Create custom filename
  file.name = `photo_${user._id}${path.parse(file.name).ext}`;
  
  // Move file to upload path
  file.mv(`${process.env.FILE_UPLOAD_PATH || './public/uploads'}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }
    
    await User.findByIdAndUpdate(user.id, { photo: file.name });
    
    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc      Get user stats
// @route     GET /api/v1/users/stats
// @access    Private/Admin
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ active: true });
  
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: lastMonth }
  });
  
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: lastWeek }
  });
  
  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek
    }
  });
});
