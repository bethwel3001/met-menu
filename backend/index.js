import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import configurations
import connectDB from './config/database.js';
import { initializeVertexAI } from './config/cloud.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scan.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Initialize AI services asynchronously
initializeVertexAI().then(() => {
  console.log('🤖 AI initialization completed');
}).catch(error => {
  console.error('AI initialization error:', error);
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/ai', aiRoutes);

// Health check endpoint with AI status
app.get('/api/health', async (req, res) => {
  const { getAIModelInfo } = await import('./config/cloud.js');
  const aiInfo = getAIModelInfo();
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'SafeMenu API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    ai: {
      available: aiInfo.available,
      status: aiInfo.available ? 'Active' : 'Fallback Mode',
      project: aiInfo.project,
      location: aiInfo.location
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      path: req.originalUrl
    }
  });
});

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 SafeMenu Backend Server Started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.MONGODB_URI}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('✅ Server is ready to accept requests');
});

export default app;