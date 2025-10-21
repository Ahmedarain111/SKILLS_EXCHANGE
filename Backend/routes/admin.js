import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import User from '../models/user.js';
import Skill from '../models/skill.js';
import Exchange from '../models/exchange.js';
import Message from '../models/message.js';

const router = express.Router();

// Admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalExchanges = await Exchange.countDocuments();
    const activeExchanges = await Exchange.countDocuments({ status: 'active' });
    const pendingExchanges = await Exchange.countDocuments({ status: 'pending' });
    const completedExchanges = await Exchange.countDocuments({ status: 'completed' });
    const disputeExchanges = await Exchange.countDocuments({ status: 'dispute' });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ joinDate: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSkills,
        totalExchanges,
        activeExchanges,
        pendingExchanges,
        completedExchanges,
        disputeExchanges,
        newUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ joinDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all exchanges
router.get('/exchanges', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const exchanges = await Exchange.find(filter)
      .populate('user1', 'name avatar email')
      .populate('user2', 'name avatar email')
      .populate('skill1')
      .populate('skill2')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Exchange.countDocuments(filter);

    res.json({
      success: true,
      exchanges,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resolve exchange dispute
router.put('/exchanges/:id/resolve', adminAuth, async (req, res) => {
  try {
    const { resolution, action } = req.body;
    
    const exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    exchange.dispute.resolution = resolution;
    exchange.dispute.resolvedBy = req.user.id;
    exchange.dispute.resolvedAt = new Date();

    if (action === 'complete') {
      exchange.status = 'completed';
      exchange.endDate = new Date();
    } else if (action === 'cancel') {
      exchange.status = 'cancelled';
    }

    await exchange.save();

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      exchange: await exchange.populate(['user1', 'user2', 'skill1', 'skill2'])
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete user's skills and exchanges
    await Skill.deleteMany({ userId: user._id });
    await Exchange.deleteMany({
      $or: [
        { user1: user._id },
        { user2: user._id }
      ]
    });

    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get platform analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // User growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: { joinDate: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joinDate' },
            month: { $month: '$joinDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Exchange status distribution
    const exchangeStatus = await Exchange.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top skills categories
    const topCategories = await Skill.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        exchangeStatus,
        topCategories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;