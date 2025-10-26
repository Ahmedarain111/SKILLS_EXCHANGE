import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'design', 'business', 'languages', 'arts', 'fitness', 'music', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  tags: [String],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userAvatar: String,
  userName: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  experience: {
    type: Number,
    default: 0
  },
  certification: {
    hasCertification: Boolean,
    files: [String]
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Skill', skillSchema);