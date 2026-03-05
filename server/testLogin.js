// Test password comparison
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servicesphere');
    console.log('Connected to MongoDB\n');

    const admin = await Admin.findOne({ email: 'administrator@servicesphere.com' });
    
    if (!admin) {
      console.log('❌ Administrator not found!');
      process.exit(1);
    }

    console.log('Testing password: Admin@123');
    const testPassword = 'Admin@123';
    
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('\n📊 Test Results:');
    console.log('Password in DB:', admin.password.substring(0, 30) + '...');
    console.log('Test Password:', testPassword);
    console.log('Bcrypt Match:', isMatch ? '✅ YES' : '❌ NO');
    
    if (isMatch) {
      console.log('\n✅ Password is correct! Login should work.');
      console.log('\n🔍 Make sure:');
      console.log('1. Backend server is running (npm start in server folder)');
      console.log('2. Using correct email: administrator@servicesphere.com');
      console.log('3. Using correct password: Admin@123');
    } else {
      console.log('\n❌ Password does NOT match!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

testLogin();
