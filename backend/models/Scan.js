import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Scan type is required'],
    enum: {
      values: ['image', 'menu', 'qr'],
      message: 'Scan type must be image, menu, or qr'
    }
  },
  input: {
    image: {
      type: String, // base64 or file reference
      sparse: true
    },
    text: {
      type: String,
      sparse: true
    },
    menuItems: [{
      type: String
    }]
  },
  result: {
    mealName: {
      type: String,
      required: true
    },
    safetyRating: {
      type: String,
      required: true,
      enum: ['green', 'yellow', 'red']
    },
    allergyWarnings: [{
      type: String
    }],
    nutritionalBreakdown: {
      fat: String,
      sugar: String,
      protein: String,
      carbohydrates: String,
      fiber: String
    },
    ingredients: [{
      type: String
    }],
    recommendation: {
      type: String,
      required: true
    },
    healthRisks: [{
      type: String
    }]
  },
  metadata: {
    fileSize: Number,
    mimeType: String,
    analysisTime: Number,
    aiModel: String
  }
}, {
  timestamps: true
});

// Compound index for user scans with timestamp
scanSchema.index({ userId: 1, createdAt: -1 });

// Index for safety ratings
scanSchema.index({ 'result.safetyRating': 1 });

// Virtual for formatted timestamp
scanSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to get safety color
scanSchema.methods.getSafetyColor = function() {
  const colors = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444'
  };
  return colors[this.result.safetyRating] || '#6b7280';
};

export default mongoose.model('Scan', scanSchema);