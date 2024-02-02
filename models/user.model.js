const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  company: {
    type: String,
    trim: true,
    default: null
  },
  phoneOtp: String
}, { timestamps: true });

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
