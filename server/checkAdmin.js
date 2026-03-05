// Check administrator account in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servicesphere');
    console.log('Connected to MongoDB\n');

    const admin = await Admin.findOne({ email: 'administrator@servicesphere.com' });
    
    if (!admin) {
      console.log('❌ Administrator not found!');
    } else {
      console.log('✅ Administrator found:');
      console.log('ID:', admin._id);
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Password (hashed):', admin.password.substring(0, 20) + '...');
      console.log('Password starts with $2:', admin.password.startsWith('$2'));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

checkAdmin();
