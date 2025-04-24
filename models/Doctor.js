const mongoose = require("mongoose");
const slugify = require("slugify");

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "prefer-not-to-say"],
      default: "prefer-not-to-say",
    },
    slug: String,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    specialization: {
      type: [String],
      required: [true, "Specialization is required"],
    },
    qualifications: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
      },
    ],
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
    },
    hospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
      },
    ],
    chambers: [
      {
        hospital: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hospital",
          required: true,
        },
        chamberName: {
          type: String,
          required: [true, "Chamber name is required"],
          trim: true
        },
        chamberNumber: {
          type: String,
          required: [true, "Chamber number is required"],
          trim: true
        },
        floor: {
          type: String,
          required: false,
          trim: true
        },
        building: {
          type: String,
          required: false,
          trim: true
        },
        fee: {
          type: Number,
          required: [true, "Consultation fee is required for this chamber"],
          min: 0
        },
        maxPatientsPerDay: {
          type: Number,
          default: null // null means no limit
        },
        availability: [
          {
            dayOfWeek: {
              type: String,
              enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
              required: true,
            },
            startTime: {
              type: String,
              required: true,
              match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Please use 24-hour format (HH:MM)"],
            },
            endTime: {
              type: String,
              required: true,
              match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Please use 24-hour format (HH:MM)"],
            },
            slotDuration: {
              type: Number,
              default: 30, // Duration in minutes
              min: [10, "Slot duration must be at least 10 minutes"],
              max: [120, "Slot duration cannot exceed 120 minutes"],
            },
            breakTime: {
              start: {
                type: String,
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Please use 24-hour format (HH:MM)"],
              },
              end: {
                type: String,
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Please use 24-hour format (HH:MM)"],
              },
            },
            isActive: {
              type: Boolean,
              default: true
            }
          }
        ],
        contactExt: {
          type: String,
          required: false
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    about: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    services: [
      {
        type: String,
        required: true,
      },
    ],
    work_experience: [
      {
        title: { type: String, required: true },
        institution: { type: String, required: true },
        years: { type: Number, required: true },
      },
    ],
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create doctor slug from the name
DoctorSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Index for searching doctors
DoctorSchema.index({ name: "text", specialization: "text" });

// Virtual for appointments
DoctorSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "doctor",
  justOne: false,
});

// Method to add a hospital to doctor's hospitals
DoctorSchema.methods.addHospital = async function (hospitalId) {
  if (!this.hospitals.includes(hospitalId)) {
    this.hospitals.push(hospitalId);
    return await this.save();
  }
  return this;
};

// Method to remove a hospital from doctor's hospitals
DoctorSchema.methods.removeHospital = async function (hospitalId) {
  this.hospitals = this.hospitals.filter(
    (hospital) => hospital.toString() !== hospitalId.toString()
  );

  // Also remove chambers for this hospital
  this.chambers = this.chambers.filter(
    (chamber) => chamber.hospital.toString() !== hospitalId.toString()
  );

  return await this.save();
};

// Method to add a new chamber
DoctorSchema.methods.addChamber = async function (chamberData) {
  // Check if the hospital is in doctor's hospitals list
  const hospitalExists = this.hospitals.some(
    (hospital) => hospital.toString() === chamberData.hospital.toString()
  );

  if (!hospitalExists) {
    throw new Error("Doctor is not associated with this hospital");
  }

  // Check if chamber with the same name and number already exists in this hospital
  const chamberExists = this.chambers.some(
    (chamber) => 
      chamber.hospital.toString() === chamberData.hospital.toString() && 
      chamber.chamberName === chamberData.chamberName &&
      chamber.chamberNumber === chamberData.chamberNumber
  );

  if (chamberExists) {
    throw new Error("Chamber with this name and number already exists in this hospital");
  }

  this.chambers.push(chamberData);
  return await this.save();
};

// Method to update chamber details
DoctorSchema.methods.updateChamber = async function (chamberId, chamberData) {
  const chamberIndex = this.chambers.findIndex(
    (chamber) => chamber._id.toString() === chamberId.toString()
  );

  if (chamberIndex === -1) {
    throw new Error("Chamber not found");
  }

  // Update chamber details
  this.chambers[chamberIndex] = {
    ...this.chambers[chamberIndex].toObject(),
    ...chamberData
  };

  return await this.save();
};

// Method to delete a chamber
DoctorSchema.methods.removeChamber = async function (chamberId) {
  this.chambers = this.chambers.filter(
    (chamber) => chamber._id.toString() !== chamberId.toString()
  );

  return await this.save();
};

// Method to add availability to a specific chamber
DoctorSchema.methods.addChamberAvailability = async function (chamberId, availabilityData) {
  const chamberIndex = this.chambers.findIndex(
    (chamber) => chamber._id.toString() === chamberId.toString()
  );

  if (chamberIndex === -1) {
    throw new Error("Chamber not found");
  }

  // Check for overlapping time slots for same day
  const overlapping = this.chambers[chamberIndex].availability.some(
    (slot) =>
      slot.dayOfWeek === availabilityData.dayOfWeek &&
      ((slot.startTime <= availabilityData.startTime && availabilityData.startTime < slot.endTime) ||
        (slot.startTime < availabilityData.endTime && availabilityData.endTime <= slot.endTime) ||
        (availabilityData.startTime <= slot.startTime && slot.endTime <= availabilityData.endTime))
  );

  if (overlapping) {
    throw new Error("This time slot overlaps with an existing availability");
  }

  this.chambers[chamberIndex].availability.push(availabilityData);
  return await this.save();
};

// Method to update chamber availability
DoctorSchema.methods.updateChamberAvailability = async function (chamberId, availabilityId, updatedData) {
  const chamberIndex = this.chambers.findIndex(
    (chamber) => chamber._id.toString() === chamberId.toString()
  );

  if (chamberIndex === -1) {
    throw new Error("Chamber not found");
  }

  const availabilityIndex = this.chambers[chamberIndex].availability.findIndex(
    (avail) => avail._id.toString() === availabilityId.toString()
  );

  if (availabilityIndex === -1) {
    throw new Error("Availability slot not found");
  }

  // Update availability
  this.chambers[chamberIndex].availability[availabilityIndex] = {
    ...this.chambers[chamberIndex].availability[availabilityIndex].toObject(),
    ...updatedData
  };

  return await this.save();
};

// Method to remove chamber availability
DoctorSchema.methods.removeChamberAvailability = async function (chamberId, availabilityId) {
  const chamberIndex = this.chambers.findIndex(
    (chamber) => chamber._id.toString() === chamberId.toString()
  );

  if (chamberIndex === -1) {
    throw new Error("Chamber not found");
  }

  this.chambers[chamberIndex].availability = this.chambers[chamberIndex].availability.filter(
    (avail) => avail._id.toString() !== availabilityId.toString()
  );

  return await this.save();
};

// Static method to find doctors by specialization
DoctorSchema.statics.findBySpecialization = async function (specialization) {
  return await this.find({ specialization: specialization }).populate(
    "hospitals",
    "name address location contactInfo"
  );
};

// Static method to find doctors working at a specific hospital
DoctorSchema.statics.findByHospital = async function (hospitalId) {
  return await this.find({ hospitals: hospitalId }).populate("hospitals", "name address");
};

// Generate available time slots for a given date and chamber
DoctorSchema.methods.getAvailableSlotsInChamber = function (chamberId, date) {
  const dayOfWeek = new Date(date)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  // Find the chamber
  const chamber = this.chambers.find(
    (c) => c._id.toString() === chamberId.toString() && c.isActive
  );

  if (!chamber) {
    return [];
  }

  // Find availability for the specified day in this chamber
  const dayAvailability = chamber.availability.filter(
    (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive
  );

  if (dayAvailability.length === 0) {
    return [];
  }

  const availableSlots = [];

  // For each availability period, generate time slots
  dayAvailability.forEach((slot) => {
    const startTime = slot.startTime.split(":");
    const endTime = slot.endTime.split(":");

    let startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);

    const slotDuration = slot.slotDuration || 30;
    
    // Handle break time if it exists
    let breakStartMinutes = null;
    let breakEndMinutes = null;
    
    if (slot.breakTime && slot.breakTime.start && slot.breakTime.end) {
      const breakStart = slot.breakTime.start.split(":");
      const breakEnd = slot.breakTime.end.split(":");
      
      breakStartMinutes = parseInt(breakStart[0]) * 60 + parseInt(breakStart[1]);
      breakEndMinutes = parseInt(breakEnd[0]) * 60 + parseInt(breakEnd[1]);
    }

    while (startMinutes + slotDuration <= endMinutes) {
      // Skip slots that fall within break time
      if (breakStartMinutes !== null && 
          ((startMinutes >= breakStartMinutes && startMinutes < breakEndMinutes) || 
           (startMinutes + slotDuration > breakStartMinutes && startMinutes < breakEndMinutes))) {
        // Move to the end of break
        startMinutes = breakEndMinutes;
        continue;
      }
      
      const hour = Math.floor(startMinutes / 60);
      const minute = startMinutes % 60;

      const slotTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      availableSlots.push({
        chamber: chamber._id,
        chamberName: chamber.chamberName,
        chamberNumber: chamber.chamberNumber,
        hospital: chamber.hospital,
        time: slotTime,
        duration: slotDuration,
        fee: chamber.fee
      });

      startMinutes += slotDuration;
    }
  });

  return availableSlots;
};

// Get all available slots across all chambers
DoctorSchema.methods.getAllAvailableSlots = function (date) {
  const allSlots = [];
  
  this.chambers.forEach(chamber => {
    if (chamber.isActive) {
      const chamberSlots = this.getAvailableSlotsInChamber(chamber._id, date);
      allSlots.push(...chamberSlots);
    }
  });
  
  // Sort by time
  return allSlots.sort((a, b) => {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
  });
};

// Find doctors with available slots in a specific hospital on a specific date
DoctorSchema.statics.findAvailableDoctors = async function (hospitalId, date, specialization = null) {
  // First find doctors who work at this hospital
  const query = { hospitals: hospitalId };
  
  // Add specialization filter if provided
  if (specialization) {
    query.specialization = specialization;
  }
  
  const doctors = await this.find(query);
  
  // Filter doctors who have chambers with availability on the specified date
  const dayOfWeek = new Date(date)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  
  const availableDoctors = doctors.filter(doctor => {
    // Check if doctor has any active chambers in this hospital with availability on this day
    return doctor.chambers.some(chamber => 
      chamber.hospital.toString() === hospitalId.toString() &&
      chamber.isActive &&
      chamber.availability.some(slot => 
        slot.dayOfWeek === dayOfWeek && 
        slot.isActive
      )
    );
  });
  
  return availableDoctors;
};

module.exports = mongoose.model("Doctor", DoctorSchema);
