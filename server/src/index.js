require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const chatRoutes = require('./routes/chat');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.init();
  }

  async init() {
    try {
      // Initialize database
      await database.connect();
      
      // Initialize middleware
      this.setupMiddleware();
      
      // Initialize routes
      this.setupRoutes();
      
      // Initialize error handling
      this.setupErrorHandling();
      
      // Start server
      this.start();
      
    } catch (error) {
      console.error(' Server initialization failed:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://production-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'MateMenu API Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: database.isConnected ? 'connected' : 'disconnected'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/scan', scanRoutes);
    this.app.use('/api/chat', chatRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to MateMenu API',
        version: '1.0.0',
        documentation: '/api/health'
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Global error handler:', error);

      // Mongoose validation error
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: errors.join(', ')
        });
      }

      // Mongoose duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          error: `${field} already exists`
        });
      }

      // JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      // Default error
      res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message
      });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(' MateMenu Server started successfully');
      console.log(` Port: ${this.port}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(` Database: ${database.isConnected ? 'Connected' : 'Disconnected'}`);
      console.log(` API Health: http://localhost:${this.port}/api/health`);
      console.log(' Server time:', new Date().toISOString());
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  async gracefulShutdown() {
    console.log('\n Received shutdown signal. Gracefully shutting down...');
    
    try {
      // Close server
      if (this.server) {
        this.server.close(() => {
          console.log(' HTTP server closed');
        });
      }

      // Close database connection
      await database.disconnect();
      
      console.log(' Server shut down gracefully');
      process.exit(0);
    } catch (error) {
      console.error(' Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
new Server();

module.exports = Server;