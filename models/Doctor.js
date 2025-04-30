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
    img: {
      type: String,
      default: "no-photo.jpg",
    },
    fee: {
      type: String,
      required: [true, "Please add consultation fee"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Please specify gender"],
    },
    degrees: {
      type: [String],
      required: [true, "Please add degrees"],
    },
    specialization: {
      type: String,
      required: [true, "Please add a specialization"],
      trim: true,
    },
    experience_years: {
      type: Number,
      required: [true, "Please specify years of experience"],
      min: 0,
    },
    consultation_type: {
      type: [String],
      required: [true, "Please specify consultation types"],
    },
    bmdc_registration: {
      type: String,
      required: [true, "Please add BMDC registration number"],
      trim: true,
    },
    about: {
      type: String,
      required: [true, "Please add about information"],
      trim: true,
    },
    chamber: [
      {
        name: {
          type: String,
          required: [true, "Please add chamber name"],
          trim: true,
        },
        address: {
          type: String,
          required: [true, "Please add chamber address"],
          trim: true,
        },
        contact: {
          type: String,
          required: [true, "Please add contact information"],
          trim: true,
        },
        availability: {
          type: String,
          required: [true, "Please add availability information"],
          trim: true,
        },
      },
    ],
    services: {
      type: [String],
      required: [true, "Please add services"],
      trim: true,
    },
    work_experience: [
      {
        title: {
          type: String,
          required: [true, "Please add job title"],
          trim: true,
        },
        institution: {
          type: String,
          required: [true, "Please add institution name"],
          trim: true,
        },
      },
    ],
    education: {
      type: [String],
      required: [true, "Please add education details"],
    },
    location: {
      type: String,
      required: [true, "Please add location"],
      trim: true,
    },
    availability: {
      type: String,
      required: [true, "Please add availability time"],
      trim: true,
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

// Method to check doctor availability based on chamber information
DoctorSchema.methods.isAvailableOn = function(date, time) {
  const dayOfWeek = new Date(date).toLocaleString('en-us', {weekday: 'long'});
  
  // Check if any chamber is available on this day and time
  return this.chamber.some(chamber => {
    // This is a simplified implementation and would need to be adjusted
    // to parse the availability string (e.g., "Saturday to Wednesday, 2 PM - 5 PM")
    const availabilityInfo = chamber.availability;
    return availabilityInfo.includes(dayOfWeek);
  });
};

module.exports = mongoose.model("Doctor", DoctorSchema);
