import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'US'
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  skillsHave: [{
    skill: String,
    level: String,
    experience: Number
  }],
  skillsWant: [{
    skill: String,
    goal: String
  }],
  joinDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);