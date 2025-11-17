const express = require('express');
const Scan = require('../models/Scan');
const aiService = require('../services/aiService');
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');

const router = express.Router();

// Scan food image
router.post('/image', 
  authenticate, 
  upload.single('image'),
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided. Please upload an image.'
        });
      }

      console.log(`Processing image scan for user: ${req.user._id}`);
      
      const userAllergies = req.user.allergies || [];
      const analysisResult = await aiService.analyzeFoodImage(
        req.file.buffer,
        userAllergies
      );

      // Create scan record
      const scan = new Scan({
        userId: req.user._id,
        dishName: analysisResult.dishName,
        ingredients: analysisResult.ingredients,
        allergens: analysisResult.allergens,
        warnings: analysisResult.warnings,
        nutritionalInfo: analysisResult.nutritionalInfo,
        safetyScore: analysisResult.safetyScore
      });

      await scan.save();

      // Update user's scan history
      await req.user.updateOne({
        $push: { 
          scanHistory: {
            $each: [scan._id],
            $slice: -50 // Keep only last 50 scans
          }
        }
      });

      console.log(`Scan completed successfully for user: ${req.user._id}`);

      res.json({
        success: true,
        data: scan,
        message: 'Food analysis completed successfully.'
      });

    } catch (error) {
      console.error('Image scan error:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze image. Please try again.'
      });
    }
  }
);

// Analyze menu text
router.post('/menu', authenticate, async (req, res) => {
  try {
    const { menuText } = req.body;

    if (!menuText || menuText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Menu text is required.'
      });
    }

    if (menuText.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Menu text too long. Maximum 5000 characters allowed.'
      });
    }

    console.log(`Processing menu analysis for user: ${req.user._id}`);

    const userPreferences = {
      allergies: req.user.allergies || [],
      dietaryPreferences: req.user.dietaryPreferences || []
    };

    const analysisResult = await aiService.analyzeMenuText(
      menuText.trim(),
      userPreferences
    );

    // Create scan record
    const scan = new Scan({
      userId: req.user._id,
      dishName: analysisResult.dishName,
      ingredients: analysisResult.ingredients,
      allergens: analysisResult.allergens,
      warnings: analysisResult.warnings,
      nutritionalInfo: analysisResult.nutritionalInfo,
      safetyScore: analysisResult.safetyScore
    });

    await scan.save();

    // Update user's scan history
    await req.user.updateOne({
      $push: { 
        scanHistory: {
          $each: [scan._id],
          $slice: -50
        }
      }
    });

    console.log(`Menu analysis completed for user: ${req.user._id}`);

    res.json({
      success: true,
      data: scan,
      message: 'Menu analysis completed successfully.'
    });

  } catch (error) {
    console.error('Menu analysis error:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze menu. Please try again.'
    });
  }
});

// Get scan history
router.get('/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters. Page must be >= 1, limit between 1-50.'
      });
    }

    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v');

    const total = await Scan.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Scan history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan history.'
    });
  }
});

// Get specific scan by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found.'
      });
    }

    res.json({
      success: true,
      data: scan
    });

  } catch (error) {
    console.error('Get scan error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan.'
    });
  }
});

module.exports = router;