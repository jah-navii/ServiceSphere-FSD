import '../config/env.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Admin from '../models/Admin.js';

await mongoose.connect(env.MONGO_URI);

const helper = await Helper.findOne({ seeded: true, approved: true }).select('name email location').lean();
const seeker = await Seeker.findOne({ seeded: true }).select('name email').lean();
const mod    = await Admin.findOne({ seeded: true, role: 'moderator', status: 'active' }).select('name email assignedLocation').lean();

const helperCount   = await Helper.countDocuments({ seeded: true, approved: true, suspended: false });
const seekerCount   = await Seeker.countDocuments({ seeded: true });
const modCount      = await Admin.countDocuments({ seeded: true, role: 'moderator', status: 'active' });
const bookingCount  = await (await import('../models/Booking.js')).default.countDocuments({ seeded: true });

console.log('\n=== DEMO CREDENTIALS ===');
console.log(`\nHELPER   (password: Password123!)`);
console.log(`  Name:  ${helper?.name ?? 'NOT FOUND'}`);
console.log(`  Email: ${helper?.email ?? 'no seeded approved helpers'}`);

console.log(`\nSEEKER   (password: Password123!)`);
console.log(`  Name:  ${seeker?.name ?? 'NOT FOUND'}`);
console.log(`  Email: ${seeker?.email ?? 'no seeded seekers'}`);

console.log(`\nMODERATOR (password: Moderator123!)`);
console.log(`  Name:  ${mod?.name ?? 'NOT FOUND'}`);
console.log(`  Email: ${mod?.email ?? 'no seeded moderators'}`);

console.log('\n=== DB COUNTS (seeded docs) ===');
console.log(`  Approved helpers: ${helperCount}`);
console.log(`  Seekers:          ${seekerCount}`);
console.log(`  Active moderators:${modCount}`);
console.log(`  Bookings:         ${bookingCount}`);
console.log('');

await mongoose.disconnect();
