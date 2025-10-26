import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.js';
import Skill from '../models/skill.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@skillswap.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'AU',
      bio: 'System Administrator',
      location: 'New York, USA'
    });

    await adminUser.save();
    console.log('Admin user created');

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', salt),
        avatar: 'JD',
        bio: 'Web developer passionate about teaching and learning',
        location: 'San Francisco, CA',
        skillsHave: [
          { skill: 'Web Development', level: 'expert', experience: 5 },
          { skill: 'JavaScript', level: 'expert', experience: 5 }
        ],
        skillsWant: [
          { skill: 'Graphic Design', goal: 'Create beautiful UI designs' },
          { skill: 'Spanish', goal: 'Travel to Spain' }
        ]
      },
      {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        password: await bcrypt.hash('password123', salt),
        avatar: 'MG',
        bio: 'Graphic designer and language enthusiast',
        location: 'Miami, FL',
        skillsHave: [
          { skill: 'Graphic Design', level: 'expert', experience: 4 },
          { skill: 'Spanish', level: 'native', experience: 10 }
        ],
        skillsWant: [
          { skill: 'Web Development', goal: 'Build personal portfolio' },
          { skill: 'Photography', goal: 'Start photography business' }
        ]
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log('Sample users created');

    // Create sample skills
    const sampleSkills = [
      {
        title: 'Web Development',
        description: 'Full-stack web development with modern technologies',
        category: 'technology',
        level: 'expert',
        tags: ['javascript', 'react', 'nodejs', 'mongodb'],
        userId: createdUsers[0]._id,
        userAvatar: 'JD',
        userName: 'John Doe',
        experience: 5,
        rating: { average: 4.8, count: 12 }
      },
      {
        title: 'Graphic Design',
        description: 'Professional graphic design for brands and marketing',
        category: 'design',
        level: 'expert',
        tags: ['photoshop', 'illustrator', 'branding', 'ui-design'],
        userId: createdUsers[1]._id,
        userAvatar: 'MG',
        userName: 'Maria Garcia',
        experience: 4,
        rating: { average: 4.9, count: 8 }
      },
      {
        title: 'Spanish Language',
        description: 'Native Spanish speaker offering language lessons',
        category: 'languages',
        level: 'native',
        tags: ['spanish', 'language', 'conversation', 'grammar'],
        userId: createdUsers[1]._id,
        userAvatar: 'MG',
        userName: 'Maria Garcia',
        experience: 10,
        rating: { average: 5.0, count: 15 }
      }
    ];

    await Skill.insertMany(sampleSkills);
    console.log('Sample skills created');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();