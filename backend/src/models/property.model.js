const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  price: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isSublet: {
    type: Boolean,
    default: false
  },
  subletDates: {
    start: Date,
    end: Date
  },
  amenities: [String],
  mediaPaths: [String],

  reviews: {
    averageRating: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Property', propertySchema);
