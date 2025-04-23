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
    degree: {
      type: [String],
      required: [true, "Please add a degree"],
    },
    about: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    specialist: {
      type: [String], // Array of specializations
      required: true,
    },
    education: [
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
    chamber: [
      {
        name: { type: String, required: true },
        address: { type: String, required: true },
        contact: { type: String, required: true },
        availability: { type: String, required: true },
      },
    ],

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
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
    // toJSON: { virtuals: true }, toObject: { virtuals: true }
  }
);

// Create bootcamp slug from the name
DoctorSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Geocode & create location field
// DoctorSchema.pre("save", async function (next) {
//   const loc = await geocoder.geocode(this.address);
//   this.location = {
//     type: "Point",
//     coordinates: [loc[0].longitude, loc[0].latitude],
//     formattedAddress: loc[0].formattedAddress,
//     street: loc[0].streetName,
//     city: loc[0].city,
//     state: loc[0].stateCode,
//     zipcode: loc[0].zipcode,
//     country: loc[0].countryCode,
//   };

//   // Do not save address in DB
//   this.address = undefined;
//   next();
// });

// Cascade delete courses when a bootcamp is deleted
// DoctorSchema.pre("remove", async function (next) {
//   console.log(`Courses being removed from bootcamp ${this._id}`);
//   await this.model("Course").deleteMany({ bootcamp: this._id });
//   console.log(`Reviews being removed from bootcamp ${this._id}`);
//   await this.model("Review").deleteMany({ bootcamp: this._id });
//   next();
// });

// Reverse populate with virtuals
// DoctorSchema.virtual("courses", {
//   ref: "Course",
//   localField: "_id",
//   foreignField: "bootcamp",
//   justOne: false,
// });

module.exports = mongoose.model("Doctor", DoctorSchema);
