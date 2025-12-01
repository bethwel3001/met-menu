import Scan from '../models/Scan.js';
import User from '../models/User.js';
import { AIService } from '../services/ai-service.js';
import { FileService } from '../services/file-service.js';

export const analyzeMeal = async (req, res, next) => {
  let tempFilePath = null;
  
  try {
    const { type } = req.body;
    const { userId } = req;
    const file = req.file;

    if (!type || !['image', 'menu'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: 'Type must be either "image" or "menu"'
        }
      });
    }

    if (!file && type === 'image') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded for image analysis'
        }
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    let analysisResult;
    const startTime = Date.now();

    if (type === 'image') {
      const base64Image = file.buffer.toString('base64');
      
      // Validate base64 image
      FileService.validateBase64Image(`data:${file.mimetype};base64,${base64Image}`);
      
      // Save temporary file for debugging (optional)
      try {
        tempFilePath = await FileService.saveBase64Image(
          `data:${file.mimetype};base64,${base64Image}`,
          `scan_${userId}_${Date.now()}.jpg`
        );
      } catch (fileError) {
        console.warn('Could not save temporary file:', fileError.message);
        // Continue without temp file - it's not critical
      }

      // AI analysis with fallback
      analysisResult = await AIService.analyzeMealImage(base64Image, user.profile);
    } else if (type === 'menu') {
      const menuText = req.body.text || 'Menu analysis text would go here';
      analysisResult = await AIService.analyzeMenuText(menuText, user.profile);
    }

    const analysisTime = Date.now() - startTime;

    const scan = new Scan({
      userId: user._id,
      type: type,
      input: {
        image: type === 'image' ? 'base64_image_data' : undefined,
        text: type === 'menu' ? 'extracted_menu_text' : undefined
      },
      result: analysisResult,
      metadata: {
        fileSize: file?.size,
        mimeType: file?.mimetype,
        analysisTime,
        aiModel: 'gemini-1.5-flash'
      }
    });

    await scan.save();

    // Clean up temporary file if it was created
    if (tempFilePath) {
      await FileService.deleteTempFile(tempFilePath);
    }

    res.json({
      success: true,
      message: 'Analysis completed successfully',
      data: {
        analysis: analysisResult,
        scanId: scan._id,
        metadata: {
          analysisTime: `${analysisTime}ms`,
          timestamp: scan.createdAt
        }
      }
    });

  } catch (error) {
    // Clean up temporary file on error
    if (tempFilePath) {
      await FileService.deleteTempFile(tempFilePath).catch(console.error);
    }
    next(error);
  }
};

export const getScanHistory = async (req, res, next) => {
  try {
    const { userId } = req;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const scans = await Scan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Scan.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add the missing export
export const getScanById = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const { userId } = req;

    const scan = await Scan.findOne({ _id: scanId, userId });
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found or access denied'
        }
      });
    }

    res.json({
      success: true,
      data: {
        scan
      }
    });

  } catch (error) {
    next(error);
  }
};