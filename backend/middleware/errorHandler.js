const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error Stack:', err.stack);
  
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('❌ Error Details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found - invalid ID format';
    error = {
      code: 'INVALID_ID',
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} '${value}' already exists`;
    error = {
      code: 'DUPLICATE_ENTRY',
      message,
      field,
      value,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    
    const message = 'Validation failed. Please check your input.';
    error = {
      code: 'VALIDATION_ERROR',
      message,
      details: errors,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token expired',
      statusCode: 401
    };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      code: 'FILE_TOO_LARGE',
      message: `File size too large. Maximum allowed: ${process.env.MAX_FILE_SIZE} bytes`,
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      code: 'INVALID_FILE_FIELD',
      message: 'Unexpected file field',
      statusCode: 400
    };
  }

  // Final error response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      ...(error.details && { details: error.details }),
      ...(error.field && { field: error.field })
    },
    timestamp: new Date().toISOString()
  };

  // Don't leak stack trace in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    response.error.message = 'Internal Server Error';
    delete response.error.stack;
    delete response.error.details;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;