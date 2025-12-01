import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  startChat,
  sendMessage,
  getChatHistory,
  getChatById
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/start', authenticate, startChat);
router.post('/:chatId/message', authenticate, sendMessage);
router.get('/history', authenticate, getChatHistory);
router.get('/:chatId', authenticate, getChatById);

export default router;