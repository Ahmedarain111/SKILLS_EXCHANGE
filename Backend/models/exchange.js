import mongoose from 'mongoose';

const exchangeSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  skill2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'dispute'],
    default: 'pending'
  },
  tasks: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    task: String,
    status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
    dueDate: Date
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  proposedSchedule: {
    frequency: String,
    duration: Number,
    preferredDays: [String]
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  dispute: {
    hasDispute: { type: Boolean, default: false },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    resolution: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.model('Exchange', exchangeSchema);