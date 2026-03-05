// Script to create the first Administrator account
// Run this with: node createAdministrator.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createAdministrator = async () => {
  try {
    // Connect to MongoDB - use MONGO_URI from .env (same as server)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/servicesphere';
    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB:', mongoUri);
    console.log('Database:', mongoose.connection.name);
    console.log('');

    // Administrator credentials
    const administratorData = {
      name: 'Super Admin',
      email: 'administrator@servicesphere.com',
      password: 'Admin@123', // Change this to a secure password
      role: 'administrator' // This is the key field!
    };

    // Check if administrator already exists
    const existingAdmin = await Admin.findOne({ 
      email: administratorData.email 
    });

    if (existingAdmin) {
      console.log('❌ Administrator with this email already exists!');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(administratorData.password, 10);

    // Create the administrator
    const administrator = new Admin({
      name: administratorData.name,
      email: administratorData.email,
      password: hashedPassword,
      role: 'administrator',
      status: 'active' // Administrators are active by default
    });

    await administrator.save();

    console.log('✅ Administrator account created successfully!');
    console.log('📧 Email:', administratorData.email);
    console.log('🔑 Password:', administratorData.password);
    console.log('👤 Role:', administrator.role);
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\n🚀 You can now login at: http://localhost:3000/login/admin');

  } catch (error) {
    console.error('❌ Error creating administrator:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createAdministrator();
