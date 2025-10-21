import express from 'express';
import { auth } from '../middleware/auth.js';
import Exchange from '../models/exchange.js';
import Skill from '../models/skill.js';
import Message from '../models/message.js';

const router = express.Router();

// Create exchange proposal
router.post('/', auth, async (req, res) => {
  try {
    const { skill1Id, skill2Id, proposedSchedule } = req.body;

    const skill1 = await Skill.findById(skill1Id);
    const skill2 = await Skill.findById(skill2Id);

    if (!skill1 || !skill2) {
      return res.status(404).json({ success: false, message: 'Skills not found' });
    }

    // Check if user owns skill1
    if (skill1.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only propose exchanges with your own skills' });
    }

    const exchange = new Exchange({
      user1: req.user.id,
      user2: skill2.userId,
      skill1: skill1Id,
      skill2: skill2Id,
      proposedSchedule,
      tasks: [
        { user: req.user.id, task: `Teach ${skill1.title}`, status: 'not-started' },
        { user: skill2.userId, task: `Teach ${skill2.title}`, status: 'not-started' }
      ]
    });

    await exchange.save();

    // Create initial message
    const message = new Message({
      exchangeId: exchange._id,
      sender: req.user.id,
      receiver: skill2.userId,
      content: `I'd like to exchange ${skill1.title} for ${skill2.title}`,
      messageType: 'proposal'
    });

    await message.save();

    // Add message to exchange
    exchange.messages.push(message._id);
    await exchange.save();

    res.status(201).json({
      success: true,
      message: 'Exchange proposal sent successfully',
      exchange: await exchange.populate(['user1', 'user2', 'skill1', 'skill2'])
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's exchanges
router.get('/my-exchanges', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const exchanges = await Exchange.find(filter)
      .populate('user1', 'name avatar')
      .populate('user2', 'name avatar')
      .populate('skill1')
      .populate('skill2')
      .sort({ createdAt: -1 });

    res.json({ success: true, exchanges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get exchange by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('user1', 'name avatar email')
      .populate('user2', 'name avatar email')
      .populate('skill1')
      .populate('skill2')
      .populate('messages');

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    // Check if user is part of exchange
    if (exchange.user1._id.toString() !== req.user.id && 
        exchange.user2._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update exchange status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const exchange = await Exchange.findOne({
      _id: req.params.id,
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    });

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    exchange.status = status;
    
    if (status === 'completed') {
      exchange.endDate = new Date();
    }

    await exchange.save();

    res.json({
      success: true,
      message: 'Exchange status updated successfully',
      exchange: await exchange.populate(['user1', 'user2', 'skill1', 'skill2'])
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update task status
router.put('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const exchange = await Exchange.findOne({
      _id: req.params.id,
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    });

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    const task = exchange.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await exchange.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      exchange
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Report dispute
router.post('/:id/dispute', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const exchange = await Exchange.findOne({
      _id: req.params.id,
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    });

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    exchange.status = 'dispute';
    exchange.dispute = {
      hasDispute: true,
      reportedBy: req.user.id,
      reason,
      resolved: false
    };

    await exchange.save();

    res.json({
      success: true,
      message: 'Dispute reported successfully',
      exchange
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;