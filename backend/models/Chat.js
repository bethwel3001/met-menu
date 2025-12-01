import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    index: true
  },
  title: {
    type: String,
    default: 'Food Safety Discussion',
    trim: true,
    maxlength: 100
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    messageCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ scanId: 1 });
chatSchema.index({ 'metadata.lastActivity': -1 });

// Pre-save middleware to update metadata
chatSchema.pre('save', function(next) {
  this.metadata.messageCount = this.messages.length;
  this.metadata.lastActivity = new Date();
  
  // Auto-generate title from first message if not set
  if (this.messages.length > 0 && this.title === 'Food Safety Discussion') {
    const firstMessage = this.messages[0].content;
    this.title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
  }
  
  next();
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Method to add message
chatSchema.methods.addMessage = function(role, content) {
  this.messages.push({
    role,
    content,
    timestamp: new Date()
  });
  return this.save();
};

// Static method to find active chats
chatSchema.statics.findActiveChats = function(userId) {
  return this.find({ userId, isActive: true }).sort({ 'metadata.lastActivity': -1 });
};

export default mongoose.model('Chat', chatSchema);