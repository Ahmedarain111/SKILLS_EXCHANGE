import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import Skill from '../models/skill.js';
import User from '../models/user.js';

const router = express.Router();

// Get all skills with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      level, 
      search, 
      tags, 
      page = 1, 
      limit = 12 
    } = req.query;

    let filter = { isAvailable: true };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skills = await Skill.find(filter)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Skill.countDocuments(filter);

    res.json({
      success: true,
      skills,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new skill
router.post('/', auth, upload.array('certifications', 5), async (req, res) => {
  try {
    const { title, description, category, level, tags, experience } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const skill = new Skill({
      title,
      description,
      category,
      level,
      tags: tags ? tags.split(',') : [],
      experience: parseInt(experience) || 0,
      userId: req.user.id,
      userAvatar: user.avatar,
      userName: user.name,
      certification: {
        hasCertification: req.files && req.files.length > 0,
        files: req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
      }
    });

    await skill.save();

    // Add to user's skillsHave
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        skillsHave: {
          skill: title,
          level: level,
          experience: parseInt(experience) || 0
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get skill by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('userId', 'name avatar bio location');
    
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update skill
router.put('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    Object.assign(skill, req.body);
    await skill.save();

    res.json({
      success: true,
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search skills
router.get('/search/:query', auth, async (req, res) => {
  try {
    const skills = await Skill.find({
      $and: [
        { isAvailable: true },
        {
          $or: [
            { title: { $regex: req.params.query, $options: 'i' } },
            { description: { $regex: req.params.query, $options: 'i' } },
            { tags: { $regex: req.params.query, $options: 'i' } }
          ]
        }
      ]
    }).populate('userId', 'name avatar').limit(10);

    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;