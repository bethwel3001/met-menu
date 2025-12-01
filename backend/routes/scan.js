import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { handleFileUpload } from '../middleware/upload.js';
import {
  analyzeMeal,
  getScanHistory,
  getScanById
} from '../controllers/scanController.js';

const router = express.Router();

router.post('/analyze', authenticate, handleFileUpload('file'), analyzeMeal);
router.get('/history', authenticate, getScanHistory);
router.get('/:scanId', authenticate, getScanById);

export default router;