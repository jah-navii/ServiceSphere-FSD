/**
 * create-admin.js — creates administrator@servicesphere.com if it doesn't exist
 * Run:  node scripts/create-admin.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

await mongoose.connect(process.env.MONGO_URI);

const hash = await bcrypt.hash('administrator', 10);

const result = await mongoose.connection.collection('admins').updateOne(
  { email: 'administrator@servicesphere.com' },
  {
    $setOnInsert: {
      name:             'Administrator',
      email:            'administrator@servicesphere.com',
      password:         hash,
      role:             'administrator',
      status:           'active',
      phone:            '',
      assignedLocation: null,
      coverLetter:      null,
      experience:       null,
      linkedinProfile:  null,
      resume:           null,
      applicationDate:  new Date(),
      approvedBy:       null,
    },
  },
  { upsert: true }
);

if (result.upsertedCount) {
  console.log('✔ Created: administrator@servicesphere.com / administrator');
} else {
  console.log('ℹ Account already exists — no changes made');
}

await mongoose.disconnect();
