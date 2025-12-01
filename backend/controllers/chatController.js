import Chat from '../models/Chat.js';
import { AIService } from '../services/ai-service.js';

export const startChat = async (req, res, next) => {
  try {
    const { userId } = req;
    const { scanId, initialMessage } = req.body;

    if (!initialMessage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MESSAGE',
          message: 'Initial message is required'
        }
      });
    }

    const User = (await import('../models/User.js')).default;
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

    const chat = new Chat({
      userId,
      scanId,
      messages: [{
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      }]
    });

    // Generate AI response
    const aiResponse = await AIService.generateChatResponse(
      initialMessage,
      'New conversation about food safety',
      user.profile
    );

    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    await chat.save();

    res.status(201).json({
      success: true,
      message: 'Chat started successfully',
      data: {
        chat: {
          id: chat._id,
          title: chat.title,
          messages: chat.messages,
          metadata: chat.metadata
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { userId } = req;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MESSAGE',
          message: 'Message content is required'
        }
      });
    }

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_NOT_FOUND',
          message: 'Chat not found or access denied'
        }
      });
    }

    // Add user message
    await chat.addMessage('user', message);

    // Get user profile for context
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);

    // Generate AI response
    const context = chat.messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
    const aiResponse = await AIService.generateChatResponse(
      message,
      context,
      user.profile
    );

    // Add AI response
    await chat.addMessage('assistant', aiResponse);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        chat: {
          id: chat._id,
          messages: chat.messages,
          metadata: chat.metadata
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const chats = await Chat.find({ userId, isActive: true })
      .sort({ 'metadata.lastActivity': -1 })
      .limit(limitNum)
      .skip(skip)
      .select('title messages metadata isActive createdAt')
      .lean();

    const total = await Chat.countDocuments({ userId, isActive: true });

    res.json({
      success: true,
      data: {
        chats,
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

export const getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { userId } = req;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_NOT_FOUND',
          message: 'Chat not found or access denied'
        }
      });
    }

    res.json({
      success: true,
      data: {
        chat
      }
    });

  } catch (error) {
    next(error);
  }
};