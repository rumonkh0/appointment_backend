const path = require("path");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Get all doctors with filtering and sorting (no pagination)
// @route     GET /api/v1/doctors
// @access    Public
exports.getDoctors = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  let query = Doctor.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Add appointment count using virtual
  query = query.populate("appointmentCount");

  // Executing query - get all doctors (no pagination)
  const doctors = await query;

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc      Get single doctor
// @route     GET /api/v1/doctors/:id
// @access    Public
exports.getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id).populate({
    path: "upcomingAppointments",
    select: "appointmentDate status",
  });

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
  // Handle the nested fields properly
  const doctorData = {
    ...req.body,
  };

  // Handle degrees if sent as string
  if (req.body.degrees && typeof req.body.degrees === "string") {
    try {
      doctorData.degrees = JSON.parse(req.body.degrees);
    } catch (err) {
      // If it's not valid JSON, try splitting by comma
      doctorData.degrees = req.body.degrees.split(",").map(degree => degree.trim());
    }
  }

  // Handle services if sent as string
  if (req.body.services && typeof req.body.services === "string") {
    try {
      doctorData.services = JSON.parse(req.body.services);
    } catch (err) {
      doctorData.services = req.body.services.split(",").map(service => service.trim());
    }
  }

  // Handle consultation_type if sent as string
  if (req.body.consultation_type && typeof req.body.consultation_type === "string") {
    try {
      doctorData.consultation_type = JSON.parse(req.body.consultation_type);
    } catch (err) {
      doctorData.consultation_type = req.body.consultation_type
        .split(",")
        .map(type => type.trim());
    }
  }

  // Handle education if sent as string
  if (req.body.education && typeof req.body.education === "string") {
    try {
      doctorData.education = JSON.parse(req.body.education);
    } catch (err) {
      doctorData.education = req.body.education.split(",").map(edu => edu.trim());
    }
  }

  // Handle chamber information
  if (req.body.chamber && typeof req.body.chamber === "string") {
    try {
      doctorData.chamber = JSON.parse(req.body.chamber);
    } catch (err) {
      return next(new ErrorResponse("Invalid chamber data format", 400));
    }
  }

  // Handle work_experience
  if (req.body.work_experience && typeof req.body.work_experience === "string") {
    try {
      doctorData.work_experience = JSON.parse(req.body.work_experience);
    } catch (err) {
      return next(new ErrorResponse("Invalid work experience data format", 400));
    }
  }

  // Create doctor
  const doctor = await Doctor.create(doctorData);

  res.status(201).json({
    success: true,
    data: doctor,
  });
});

// @desc      Edit doctor
// @route     PUT /api/v1/doctors/:id
// @access    Private
exports.editDoctor = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  // Add authorization check here if needed
  // if(doctor.user.toString() !== req.user.id && req.user.role !== 'admin') {
  //   return next(
  //     new ErrorResponse(`User is not authorized to update this doctor`, 401)
  //   );
  // }

  // Process update data
  const updateData = { ...req.body };

  // Handle arrays and objects if they come as strings
  const arrayFields = ['degrees', 'services', 'consultation_type', 'education'];
  arrayFields.forEach(field => {
    if (updateData[field] && typeof updateData[field] === 'string') {
      try {
        updateData[field] = JSON.parse(updateData[field]);
      } catch (err) {
        updateData[field] = updateData[field].split(',').map(item => item.trim());
      }
    }
  });

  // Handle nested objects
  const objectFields = ['chamber', 'work_experience'];
  objectFields.forEach(field => {
    if (updateData[field] && typeof updateData[field] === 'string') {
      try {
        updateData[field] = JSON.parse(updateData[field]);
      } catch (err) {
        // If parsing fails, we'll leave it as is and validation will catch the error
      }
    }
  });

  // Update the doctor
  doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
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

  // Add authorization check here if needed
  // if(doctor.user.toString() !== req.user.id && req.user.role !== 'admin') {
  //   return next(
  //     new ErrorResponse(`User is not authorized to delete this doctor`, 401)
  //   );
  // }

  await doctor.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Doctor removed successfully" });
});

// @desc      Get doctors by specialization
// @route     GET /api/v1/doctors/specialization/:specialization
// @access    Public
exports.getDoctorsBySpecialization = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.find({
    specialization: { $regex: req.params.specialization, $options: "i" },
  }).populate("appointmentCount");

  if (!doctors || doctors.length === 0) {
    return next(
      new ErrorResponse(
        `No doctors found with specialization ${req.params.specialization}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc      Get doctors by location
// @route     GET /api/v1/doctors/location/:location
// @access    Public
exports.getDoctorsByLocation = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.find({
    location: { $regex: req.params.location, $options: "i" },
  }).populate("appointmentCount");

  if (!doctors || doctors.length === 0) {
    return next(
      new ErrorResponse(
        `No doctors found in location ${req.params.location}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc    Get all chambers for a doctor
// @route   GET /api/v1/doctors/:id/chambers
// @access  Public
exports.getDoctorChambers = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  if (!doctor.chamber || doctor.chamber.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    count: doctor.chamber.length,
    data: doctor.chamber,
  });
});

// @desc    Get a specific chamber by ID for a doctor
// @route   GET /api/v1/doctors/:id/chambers/:chamberId
// @access  Public
exports.getDoctorChamberById = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  if (!doctor.chamber || doctor.chamber.length === 0) {
    return next(
      new ErrorResponse(`No chambers found for this doctor`, 404)
    );
  }

  const chamber = doctor.chamber.find(
    c => c._id.toString() === req.params.chamberId
  );
  
  if (!chamber) {
    return next(
      new ErrorResponse(`Chamber with id ${req.params.chamberId} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: chamber,
  });
});

// @desc    Get a specific chamber by index for a doctor
// @route   GET /api/v1/doctors/:id/chambers/:chamberIndex
// @access  Public
exports.getDoctorChamberByIndex = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  const chamberIndex = parseInt(req.params.chamberIndex);
  
  if (isNaN(chamberIndex) || chamberIndex < 0 || chamberIndex >= doctor.chamber.length) {
    return next(
      new ErrorResponse(`Chamber with index ${req.params.chamberIndex} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: doctor.chamber[chamberIndex],
  });
});

// @desc      Update doctor availability
// @route     PATCH /api/v1/doctors/:id/availability
// @access    Private
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const { available } = req.body;

  if (available === undefined) {
    return next(new ErrorResponse("Please provide availability status", 400));
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { available },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// @desc    Upload photo for doctor
// @route   PUT /api/v1/doctors/:id/photo
// @access  Private/Admin
exports.doctorPhotoUpload = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD || 1000000) {
    return next(new ErrorResponse("Please upload an image less than 1MB", 400));
  }

  // Create custom filename
  file.name = `photo_${doctor._id}${path.parse(file.name).ext}`;

  // Move file to upload path
  file.mv(
    `${process.env.FILE_UPLOAD_PATH || "./public/uploads"}/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse("Problem with file upload", 500));
      }

      await Doctor.findByIdAndUpdate(req.params.id, { img: file.name });

      res.status(200).json({
        success: true,
        data: file.name,
      });
    }
  );
});

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/v1/doctors/:id/available-slots
// @access  Public
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { date, chamberId } = req.query;

  if (!date) {
    return next(new ErrorResponse("Please provide a date", 400));
  }

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  if (!doctor.available) {
    return next(
      new ErrorResponse(
        "This doctor is currently not available for appointments",
        400
      )
    );
  }

  // Find the selected chamber or use the first one
  let selectedChamber;
  if (chamberId && doctor.chamber && doctor.chamber.length > 0) {
    selectedChamber = doctor.chamber.find(c => c._id.toString() === chamberId);
  }
  
  if (!selectedChamber && doctor.chamber && doctor.chamber.length > 0) {
    selectedChamber = doctor.chamber[0];
  }

  if (!selectedChamber) {
    return next(new ErrorResponse("No chamber information available", 400));
  }

  // Check if doctor works on this day in this chamber
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleString("en-us", {
    weekday: "long",
  });

  const daySchedule = selectedChamber.schedule.find(
    s => s.day.toLowerCase() === dayOfWeek.toLowerCase()
  );

  if (!daySchedule) {
    return next(new ErrorResponse(`Doctor does not work on ${dayOfWeek} at this chamber`, 400));
  }

  // Generate all possible slots based on working hours and slot duration
  const [fromHours, fromMinutes] = daySchedule.startTime.split(":").map(Number);
  const [toHours, toMinutes] = daySchedule.endTime.split(":").map(Number);

  const startMinutes = fromHours * 60 + fromMinutes;
  const endMinutes = toHours * 60 + toMinutes;
  const slotDuration = selectedChamber.slotDuration || 30;

  const slots = [];
  for (let i = startMinutes; i < endMinutes; i += slotDuration) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    slots.push(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  }

  // TODO: Filter out already booked slots by checking appointments
  // This would require querying the Appointment model

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots,
    chamber: selectedChamber
  });
});

// @desc      Add a chamber to a doctor
// @route     POST /api/v1/doctors/:id/chambers
// @access    Private
exports.addChamber = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  // Process chamber data
  let chamberData = req.body;
  
  // Handle schedule if sent as string
  if (req.body.schedule && typeof req.body.schedule === "string") {
    try {
      chamberData.schedule = JSON.parse(req.body.schedule);
    } catch (err) {
      return next(new ErrorResponse("Invalid schedule data format", 400));
    }
  }

  // Initialize chamber array if it doesn't exist
  if (!doctor.chamber) {
    doctor.chamber = [];
  }

  // Add the new chamber
  doctor.chamber.push(chamberData);

  // Save the doctor with the new chamber
  doctor = await doctor.save();

  res.status(201).json({
    success: true,
    data: doctor.chamber[doctor.chamber.length - 1]
  });
});

// @desc      Update a chamber for a doctor
// @route     PUT /api/v1/doctors/:id/chambers/:chamberId
// @access    Private
exports.updateChamber = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  if (!doctor.chamber || doctor.chamber.length === 0) {
    return next(
      new ErrorResponse(`No chambers found for this doctor`, 404)
    );
  }

  // Find the chamber index
  const chamberIndex = doctor.chamber.findIndex(
    c => c._id.toString() === req.params.chamberId
  );
  
  if (chamberIndex === -1) {
    return next(
      new ErrorResponse(`Chamber with id ${req.params.chamberId} not found`, 404)
    );
  }

  // Process chamber data
  let chamberData = req.body;
  
  // Handle schedule if sent as string
  if (req.body.schedule && typeof req.body.schedule === "string") {
    try {
      chamberData.schedule = JSON.parse(req.body.schedule);
    } catch (err) {
      return next(new ErrorResponse("Invalid schedule data format", 400));
    }
  }

  // Update the chamber
  doctor.chamber[chamberIndex] = {
    ...doctor.chamber[chamberIndex].toObject(),
    ...chamberData
  };

  // Save the doctor with the updated chamber
  doctor = await doctor.save();

  res.status(200).json({
    success: true,
    data: doctor.chamber[chamberIndex]
  });
});

// @desc      Delete a chamber from a doctor
// @route     DELETE /api/v1/doctors/:id/chambers/:chamberId
// @access    Private
exports.deleteChamber = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  if (!doctor.chamber || doctor.chamber.length === 0) {
    return next(
      new ErrorResponse(`No chambers found for this doctor`, 404)
    );
  }

  // Find the chamber index
  const chamberIndex = doctor.chamber.findIndex(
    c => c._id.toString() === req.params.chamberId
  );
  
  if (chamberIndex === -1) {
    return next(
      new ErrorResponse(`Chamber with id ${req.params.chamberId} not found`, 404)
    );
  }

  // Remove the chamber
  doctor.chamber.splice(chamberIndex, 1);

  // Save the doctor without the deleted chamber
  doctor = await doctor.save();

  res.status(200).json({
    success: true,
    message: "Chamber removed successfully"
  });
});
