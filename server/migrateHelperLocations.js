import mongoose from 'mongoose';
import Helper from './models/Helper.js';
import Location from './models/Location.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateHelperLocations = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jahnavipro', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to database');

    // Get all helpers
    const helpers = await Helper.find({});
    console.log(`Found ${helpers.length} helpers to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const helper of helpers) {
      // If location is already set, skip
      if (helper.location) {
        skipped++;
        continue;
      }

      // If helper has an address, try to find matching location
      if (helper.address) {
        // Find location by matching name (case-insensitive)
        const location = await Location.findOne({ 
          name: new RegExp(`^${helper.address}$`, 'i') 
        });

        if (location) {
          helper.location = location._id;
          await helper.save();
          console.log(`Updated helper ${helper.name} - Set location to ${location.name}`);
          updated++;
        } else {
          console.log(`No location found for address: ${helper.address}`);
          skipped++;
        }
      } else {
        console.log(`Helper ${helper.name} has no address`);
        skipped++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

migrateHelperLocations();
