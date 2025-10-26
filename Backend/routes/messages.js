import express from 'express';
import { auth } from '../middleware/auth.js';
import Message from '../models/message.js';
import Exchange from '../models/exchange.js';

const router = express.Router();

// Get messages for an exchange
router.get('/exchange/:exchangeId', auth, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    // Check if user is part of exchange
    if (exchange.user1.toString() !== req.user.id && 
        exchange.user2.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ exchangeId: req.params.exchangeId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { exchangeId, content, receiverId } = req.body;

    const exchange = await Exchange.findById(exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    // Check if user is part of exchange
    if (exchange.user1.toString() !== req.user.id && 
        exchange.user2.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = new Message({
      exchangeId,
      sender: req.user.id,
      receiver: receiverId,
      content,
      messageType: 'text'
    });

    await message.save();

    // Add message to exchange
    exchange.messages.push(message._id);
    await exchange.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      message: await message.populate(['sender', 'receiver'])
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    })
    .populate('user1', 'name avatar')
    .populate('user2', 'name avatar')
    .populate('skill1')
    .populate('skill2')
    .populate({
      path: 'messages',
      options: { sort: { createdAt: -1 }, limit: 1 }
    });

    const conversations = exchanges.map(exchange => {
      const otherUser = exchange.user1._id.toString() === req.user.id ? 
        exchange.user2 : exchange.user1;
      
      const lastMessage = exchange.messages[0];
      
      return {
        exchangeId: exchange._id,
        user: otherUser,
        skill1: exchange.skill1,
        skill2: exchange.skill2,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead
        } : null,
        unreadCount: exchange.messages.filter(m => !m.isRead && m.sender.toString() !== req.user.id).length
      };
    });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;