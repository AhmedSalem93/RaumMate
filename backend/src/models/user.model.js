const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  dateofBirth: { type: Date },
  city: { type: String },
  country: { type: String },
  postalCode: { type: String },
  address: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  profileCompleted: { type: Boolean, default: false },
  role: { type: String, enum: ['guest', 'registered', 'verified', 'propertyOwner', 'admin'], default: 'registered' },
  profilePicture: String,
  phone: String,
  bio: String,
  preferences: {
    type: Map,
    of: String
  },
  interests: {
    type: Map,
    of: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bycrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
