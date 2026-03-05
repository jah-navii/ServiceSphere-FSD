import mongoose from 'mongoose';
import Helper from './models/Helper.js';
import Location from './models/Location.js';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jahnavipro');
    console.log('Connected to database\n');

    // Check all locations
    const locations = await Location.find({});
    console.log('=== LOCATIONS ===');
    locations.forEach(loc => {
      console.log(`${loc.name} - ID: ${loc._id}`);
    });

    // Check helpers
    console.log('\n=== HELPERS ===');
    const helpers = await Helper.find({}).populate('location');
    helpers.forEach(h => {
      console.log(`${h.name} - Address: ${h.address} - Location ID: ${h.location?._id} - Location Name: ${h.location?.name}`);
    });

    // Check moderators
    console.log('\n=== MODERATORS ===');
    const moderators = await Admin.find({ role: 'moderator' }).populate('assignedLocation');
    moderators.forEach(m => {
      console.log(`${m.name} - Email: ${m.email} - Assigned Location ID: ${m.assignedLocation?._id} - Location Name: ${m.assignedLocation?.name} - Status: ${m.status}`);
    });

    // Check if Sri City helpers match moderator location
    console.log('\n=== SRI CITY MATCH CHECK ===');
    const sriCityLoc = await Location.findOne({ name: /sri city/i });
    if (sriCityLoc) {
      console.log(`Sri City Location ID: ${sriCityLoc._id}`);
      const sriCityHelpers = await Helper.find({ location: sriCityLoc._id });
      console.log(`Helpers in Sri City: ${sriCityHelpers.length}`);
      sriCityHelpers.forEach(h => console.log(`  - ${h.name} (${h.email})`));
      
      const sriCityModerator = await Admin.findOne({ role: 'moderator', assignedLocation: sriCityLoc._id });
      if (sriCityModerator) {
        console.log(`Moderator for Sri City: ${sriCityModerator.name} (${sriCityModerator.email})`);
      } else {
        console.log('No moderator found for Sri City');
      }
    } else {
      console.log('Sri City location not found');
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkData();
