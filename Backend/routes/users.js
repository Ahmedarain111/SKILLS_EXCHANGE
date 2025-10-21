import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import User from '../models/user.js';
import Skill from '../models/skill.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, location, skillsHave, skillsWant } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name, 
        bio, 
        location,
        skillsHave: skillsHave || [],
        skillsWant: skillsWant || []
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: `/uploads/${req.file.filename}` },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Avatar updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's skills
router.get('/skills', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user.id });
    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skillsHave.skill')
      .populate('skillsWant.skill');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;