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
    slug: String,
    specialization: {
      type: String,
      required: [true, "Please add a specialization"],
      trim: true,
    },
    qualifications: [{
      degree: {
        type: String,
        required: true,
        trim: true
      },
      institution: {
        type: String,
        required: true,
        trim: true
      },
      year: {
        type: Number
      }
    }],
    education: {
      type: String,
      required: [true, "Please add education details"],
      trim: true,
    },
    experience: {
      years: {
        type: Number,
        required: [true, "Please specify years of experience"],
        min: 0
      },
      details: {
        type: String,
        required: [true, "Please add experience details"],
        trim: true,
      }
    },
    hospital: {
      name: {
        type: String,
        required: [true, "Please add hospital name"],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    contactInfo: {
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Please add a contact phone number"],
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
      socialMedia: {
        linkedin: String,
        twitter: String,
        facebook: String
      }
    },
    workingHours: {
      from: {
        type: String,
        required: [true, "Please specify starting time"]
      },
      to: {
        type: String,
        required: [true, "Please specify ending time"]
      },
      workingDays: {
        type: [String],
        required: [true, "Please specify working days"],
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      },
      slotDuration: {
        type: Number,
        default: 30, // Duration in minutes
        min: 5,
        max: 120
      }
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    fee: {
      consultation: {
        type: Number,
        required: true,
        min: 0,
      },
      followUp: {
        type: Number,
        min: 0,
      }
    },
    languages: {
      type: [String],
      default: ["English"]
    },
    available: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "no-photo.jpg",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
      trim: true,
    },
    services: {
      type: [String],
      trim: true,
    },
    acceptsInsurance: {
      type: Boolean,
      default: false
    },
    insuranceProviders: {
      type: [String]
    },
    averageConsultationTime: {
      type: Number, // in minutes
      default: 30
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create doctor slug from the name
DoctorSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual field for appointment count
DoctorSchema.virtual('appointmentCount', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
  justOne: false,
  count: true
});

// Virtual field for upcoming appointments
DoctorSchema.virtual('upcomingAppointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
  justOne: false,
  match: { 
    appointmentDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  }
});

// Calculate average rating from reviews
DoctorSchema.statics.getAverageRating = async function(doctorId) {
  const obj = await this.aggregate([
    {
      $match: { doctor: doctorId }
    },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.findByIdAndUpdate(doctorId, {
        rating: obj[0].averageRating.toFixed(1)
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Method to check doctor availability
DoctorSchema.methods.isAvailableOn = function(date, time) {
  const dayOfWeek = new Date(date).toLocaleString('en-us', {weekday: 'long'});
  
  // Check if doctor works on this day
  if (!this.workingHours.workingDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if time is within working hours
  const [hours, minutes] = time.split(':').map(Number);
  const requestTime = hours * 60 + minutes;
  
  const [fromHours, fromMinutes] = this.workingHours.from.split(':').map(Number);
  const fromTime = fromHours * 60 + fromMinutes;
  
  const [toHours, toMinutes] = this.workingHours.to.split(':').map(Number);
  const toTime = toHours * 60 + toMinutes;
  
  return requestTime >= fromTime && requestTime <= toTime;
};

module.exports = mongoose.model("Doctor", DoctorSchema);
