import multer from 'multer';
import path from 'path';

// Configure allowed file types
const allowedMimeTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp')
  .split(',')
  .map(type => type.trim());

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
    }
  } catch (error) {
    cb(new Error('Error processing file type'), false);
  }
};

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Maximum 1 file per request
  },
  fileFilter: fileFilter
});

// Error handling wrapper for multer
export const handleFileUpload = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE} bytes`
            }
          });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILE_FIELD',
              message: `Unexpected file field. Expected: ${fieldName}`
            }
          });
        }

        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: err.message
            }
          });
        }

        // Generic multer error
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_UPLOAD_ERROR',
            message: 'File upload failed'
          }
        });
      }

      // Check if file was uploaded (for required file uploads)
      if (!req.file && fieldName === 'file') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'No file was uploaded'
          }
        });
      }

      next();
    });
  };
};

// Multiple file upload handler (if needed in future)
export const handleMultipleFileUpload = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};