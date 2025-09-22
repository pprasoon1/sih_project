import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/departmentSchema.js'; // Adjust the path to your model

// Configure environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const departments = [
  {
    name: 'Public Works Department (PWD)',
    categories: ['pothole', 'streetlight', 'road damage', 'public infrastructure'],
    staffIds: [
      new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a90'),
      new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a91'),
    ],
    serviceAreas: [{
      center: [77.51, 28.46], // Approx. Pari Chowk, Greater Noida
      radiusMeters: 5000,
    }],
  },
  {
    name: 'Health & Sanitation Department',
    categories: ['garbage', 'sewage overflow', 'dead animal', 'public toilet'],
    staffIds: [
      new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a92'),
      new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a93'),
    ],
    serviceAreas: [{
      center: [77.50, 28.47], // Approx. Alpha/Beta Sectors
      radiusMeters: 3500,
    }],
  },
  {
    name: 'Horticulture Department',
    categories: ['fallen tree', 'park maintenance', 'trimming', 'grass cutting'],
    staffIds: [new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a94')],
    serviceAreas: [], // City-wide jurisdiction
  },
  {
    name: 'Water Department (Jal Vibhag)',
    categories: ['water leak', 'pipeline damage', 'no supply', 'water contamination'],
    staffIds: [
      new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a90'), // Staff can be in multiple departments
      new mongoose.Types.ObjectId('67e1a3b12f3b4c5d6e7f8a92'),
    ],
    serviceAreas: [{
      center: [77.49, 28.48], // Approx. Knowledge Park
      radiusMeters: 4500,
    }],
  },
];

const seedDB = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connection established.');

    // 2. Clear existing departments
    await Department.deleteMany({});
    console.log('🗑️  Previous departments deleted.');

    // 3. Insert the new departments
    await Department.insertMany(departments);
    console.log('🌱 Departments have been seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  } finally {
    // 4. Disconnect from the database
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

seedDB();