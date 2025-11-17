const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isAllergen: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  }
});

const warningSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['allergy', 'dietary', 'health'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  ingredient: String
});

const nutritionalInfoSchema = new mongoose.Schema({
  calories: {
    type: Number,
    min: 0,
    default: 0
  },
  protein: {
    type: Number,
    min: 0,
    default: 0
  },
  carbs: {
    type: Number,
    min: 0,
    default: 0
  },
  fat: {
    type: Number,
    min: 0,
    default: 0
  },
  fiber: {
    type: Number,
    min: 0,
    default: 0
  }
});

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: String,
  dishName: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [ingredientSchema],
  allergens: [String],
  warnings: [warningSchema],
  nutritionalInfo: nutritionalInfoSchema,
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ safetyScore: 1 });

module.exports = mongoose.model('Scan', scanSchema);