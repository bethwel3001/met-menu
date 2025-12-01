import express from 'express';
import { getAIModelInfo, isAIAvailable } from '../config/cloud.js';

const router = express.Router();

// AI status endpoint
router.get('/status', (req, res) => {
  const aiInfo = getAIModelInfo();
  
  res.json({
    success: true,
    data: {
      ai: aiInfo,
      message: aiInfo.available 
        ? 'AI services are active and available' 
        : 'AI services are in fallback mode'
    }
  });
});

// Test AI endpoint
router.get('/test', async (req, res) => {
  try {
    if (!isAIAvailable()) {
      return res.json({
        success: false,
        error: {
          code: 'AI_UNAVAILABLE',
          message: 'AI services are not available. Using fallback mode.'
        }
      });
    }

    const { getGenerativeModel } = await import('../config/cloud.js');
    const model = getGenerativeModel();
    
    const result = await model.generateContent('Hello, are you working? Respond with "AI is working correctly" if you can read this.');
    const response = await result.response;
    
    res.json({
      success: true,
      data: {
        message: 'AI test successful',
        response: response.candidates[0].content.parts[0].text,
        model: getAIModelInfo().model
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_TEST_FAILED',
        message: error.message
      }
    });
  }
});

export default router;