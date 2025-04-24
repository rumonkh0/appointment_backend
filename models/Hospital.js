const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [100, "Hospital name cannot exceed 100 characters"],
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
    },
    // Adding geolocation data for the hospital
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      // [longitude, latitude]
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
      },
      formattedAddress: String
    },
    contactInfo: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please provide a valid email address",
        ],
      },
      website: {
        type: String,
        trim: true,
      },
    },
    specialty: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    facilities: {
      type: [String],
      default: [],
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot be more than 5"],
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create index for hospital search
hospitalSchema.index({
  name: "text",
  "address.city": "text",
  specialty: "text",
});

// Create 2dsphere index for geospatial queries
hospitalSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for appointment counts
hospitalSchema.virtual("appointmentCount", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "hospital",
  count: true,
});

// Method to assign doctor to hospital
hospitalSchema.methods.assignDoctor = async function (doctorId) {
  if (!this.doctors.includes(doctorId)) {
    this.doctors.push(doctorId);
    return await this.save();
  }
  return this;
};

// Method to remove doctor from hospital
hospitalSchema.methods.removeDoctor = async function (doctorId) {
  this.doctors = this.doctors.filter(
    (doctor) => doctor.toString() !== doctorId.toString()
  );
  return await this.save();
};

// Pre-save middleware to update the 'updatedAt' field
hospitalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Geocoder middleware to convert address to coordinates
// Uncomment and implement using a geocoding service of your choice
/*
hospitalSchema.pre('save', async function(next) {
  if (!this.isModified('address')) {
    return next();
  }
  
  const fullAddress = `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
  
  try {
    // Example using node-geocoder
    const geocoder = require('../utils/geocoder');
    const loc = await geocoder.geocode(fullAddress);
    
    this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress
    };
    
    next();
  } catch (err) {
    console.error('Geocoding error:', err);
    next();
  }
});
*/

// Static method to get hospitals with available doctors
hospitalSchema.statics.getHospitalsWithDoctors = async function () {
  return await this.find({
    doctors: { $exists: true, $not: { $size: 0 } },
  }).populate("doctors", "name specialization availability");
};

// Static method to find hospitals by specialty
hospitalSchema.statics.findBySpecialty = async function (specialty) {
  return await this.find({ specialty: specialty }).populate(
    "doctors",
    "name specialization"
  );
};

// Static method to find hospitals within a radius
hospitalSchema.statics.findHospitalsNearby = async function(longitude, latitude, radius = 10, unit = 'km') {
  // Calculate radius in radians
  // Earth radius in km is ~6,371 km or ~3,963 miles
  const radiusInRadians = unit === 'km' 
    ? radius / 6371 
    : radius / 3963;

  return await this.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInRadians]
      }
    }
  });
};

// Static method to find hospitals near a location, returning distance information
hospitalSchema.statics.findHospitalsByDistance = async function(longitude, latitude, maxDistance = 10000, limit = 10) {
  return await this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        distanceField: 'distance',
        maxDistance: maxDistance, // in meters
        spherical: true
      }
    },
    {
      $project: {
        name: 1,
        address: 1,
        specialty: 1,
        location: 1,
        contactInfo: 1,
        distance: 1, // Distance in meters
        distanceInKm: { $divide: ['$distance', 1000] }, // Convert to kilometers
        distanceInMiles: { $divide: ['$distance', 1609.34] } // Convert to miles
      }
    },
    { $limit: limit }
  ]);
};

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;
