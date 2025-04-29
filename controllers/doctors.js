const path = require("path");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Get all doctors with filtering, sorting, and pagination
// @route     GET /api/v1/doctors
// @access    Public
exports.getDoctors = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

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

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Doctor.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Add appointment count using virtual
  query = query.populate("appointmentCount");

  // Executing query
  const doctors = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: doctors.length,
    pagination,
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
    // Ensure proper structure for nested fields
    experience: {
      years: req.body.experienceYears || 0,
      details: req.body.experience || req.body.experienceDetails || "",
    },
    hospital: {
      name: req.body.hospital || req.body.hospitalName || "",
      address: req.body.hospitalAddress || "",
    },
  };

  // If the request contains qualification items, structure them properly
  if (req.body.qualifications) {
    // If qualifications is sent as a JSON string, parse it
    if (typeof req.body.qualifications === "string") {
      try {
        doctorData.qualifications = JSON.parse(req.body.qualifications);
      } catch (err) {
        return next(new ErrorResponse("Invalid qualifications format", 400));
      }
    }
  } else if (req.body.degree && req.body.institution) {
    // Handle single qualification sent as separate fields
    doctorData.qualifications = [
      {
        degree: req.body.degree,
        institution: req.body.institution,
        year: req.body.year,
      },
    ];
  }

  // Handle working hours formatting
  if (req.body.workingDays) {
    doctorData.workingHours = {
      from: req.body.from || "09:00",
      to: req.body.to || "17:00",
      workingDays: Array.isArray(req.body.workingDays)
        ? req.body.workingDays
        : req.body.workingDays.split(",").map((day) => day.trim()),
      slotDuration: req.body.slotDuration || 30,
    };
  }

  // Handle fee structure
  if (req.body.fee) {
    doctorData.fee = {
      consultation: req.body.fee,
      followUp: req.body.followUpFee || req.body.fee * 0.7, // Default follow-up to 70% of consultation
    };
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

  // Handle nested field updates
  if (
    req.body.experience ||
    req.body.experienceYears ||
    req.body.experienceDetails
  ) {
    updateData.experience = {
      years: req.body.experienceYears || doctor.experience?.years || 0,
      details:
        req.body.experience ||
        req.body.experienceDetails ||
        doctor.experience?.details ||
        "",
    };
  }

  if (req.body.hospital || req.body.hospitalName || req.body.hospitalAddress) {
    updateData.hospital = {
      name:
        req.body.hospital ||
        req.body.hospitalName ||
        doctor.hospital?.name ||
        "",
      address: req.body.hospitalAddress || doctor.hospital?.address || "",
    };
  }

  // Handle fee updates
  if (req.body.fee) {
    updateData.fee = {
      consultation: req.body.fee,
      followUp:
        req.body.followUpFee || doctor.fee?.followUp || req.body.fee * 0.7,
    };
  }

  // Update qualifications if provided
  if (req.body.qualifications) {
    if (typeof req.body.qualifications === "string") {
      try {
        updateData.qualifications = JSON.parse(req.body.qualifications);
      } catch (err) {
        return next(new ErrorResponse("Invalid qualifications format", 400));
      }
    }
  }

  // Handle working hours update
  if (
    req.body.workingDays ||
    req.body.from ||
    req.body.to ||
    req.body.slotDuration
  ) {
    updateData.workingHours = {
      from: req.body.from || doctor.workingHours?.from || "09:00",
      to: req.body.to || doctor.workingHours?.to || "17:00",
      workingDays: req.body.workingDays
        ? Array.isArray(req.body.workingDays)
          ? req.body.workingDays
          : req.body.workingDays.split(",").map((day) => day.trim())
        : doctor.workingHours?.workingDays || [],
      slotDuration:
        req.body.slotDuration || doctor.workingHours?.slotDuration || 30,
    };
  }

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

      await Doctor.findByIdAndUpdate(req.params.id, { image: file.name });

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
  const { date } = req.query;

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

  // Check if doctor works on this day
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleString("en-us", {
    weekday: "long",
  });

  if (!doctor.workingHours.workingDays.includes(dayOfWeek)) {
    return next(new ErrorResponse(`Doctor does not work on ${dayOfWeek}`, 400));
  }

  // Generate all possible slots based on working hours and slot duration
  const [fromHours, fromMinutes] = doctor.workingHours.from
    .split(":")
    .map(Number);
  const [toHours, toMinutes] = doctor.workingHours.to.split(":").map(Number);

  const startMinutes = fromHours * 60 + fromMinutes;
  const endMinutes = toHours * 60 + toMinutes;
  const slotDuration = doctor.workingHours.slotDuration || 30;

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
  });
});
