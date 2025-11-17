const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  // Extended profile fields
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  profilePicture: {
    type: String, // URL to image
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
    default: ''
  },
  backupEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  // Medical and dietary info
  allergies: [{
    type: String,
    trim: true
  }],
  dietaryPreferences: [{
    type: String,
    trim: true
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  scanHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan'
  }],
  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    safetyAlerts: { type: Boolean, default: true },
    newFeatures: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Remove duplicate index - only keep this one
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// FIX: Changed from 'userUser' to 'userSchema'
module.exports = mongoose.model('User', userSchema);