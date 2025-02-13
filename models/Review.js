const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
},{timestamps: true});

// Prevent user from submitting more than one review per doctor
ReviewSchema.index({ doctor: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(doctorId) {
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
      await this.model("Doctor").findByIdAndUpdate(doctorId, {
        averageRating: obj[0].averageRating.toFixed(1),
      });
    } else {
      await this.model("Doctor").findByIdAndUpdate(doctorId, {
        averageRating: undefined,
      });
    }
  }  catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.doctor);
});

// Call getAverageCost before remove
ReviewSchema.post('remove', async function() {
  await this.constructor.getAverageRating(this.doctor);
});

module.exports = mongoose.model('Review', ReviewSchema);
