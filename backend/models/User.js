import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    immutable: true // This makes phone number unchangeable after creation
  },
  profile: {
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    healthConditions: [{
      type: String,
      trim: true
    }],
    allergies: [{
      type: String,
      trim: true
    }],
    dietaryRestrictions: [{
      type: String,
      trim: true
    }],
    preferredMeat: [{
      type: String,
      trim: true
    }],
    favoriteMeals: [{
      type: String,
      trim: true
    }],
    completed: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to set display name from email if not provided
userSchema.pre('save', function(next) {
  if (!this.profile.displayName && this.email) {
    // Extract name from email (e.g., "john.doe@email.com" -> "John Doe")
    const emailName = this.email.split('@')[0];
    this.profile.displayName = emailName
      .split(/[._]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  next();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function() {
  const fields = [
    this.email,
    this.phoneNumber,
    this.profile.displayName,
    this.profile.healthConditions?.length > 0,
    this.profile.allergies?.length > 0,
    this.profile.dietaryRestrictions?.length > 0
  ];
  
  const completedFields = fields.filter(field => {
    if (Array.isArray(field)) return field.length > 0;
    return Boolean(field);
  }).length;

  this.profile.completed = Math.round((completedFields / fields.length) * 100);
  return this.profile.completed;
};

// Method to update profile (only updates profile fields, not phone number)
userSchema.methods.updateProfile = async function(profileData) {
  // Only update the profile fields, not the phone number
  this.profile = { 
    ...this.profile, 
    ...profileData 
  };
  this.calculateProfileCompletion();
  return this.save();
};

// Method to update avatar
userSchema.methods.updateAvatar = async function(avatarUrl) {
  this.profile.avatar = avatarUrl;
  this.calculateProfileCompletion();
  return this.save();
};

export default mongoose.model('User', userSchema);