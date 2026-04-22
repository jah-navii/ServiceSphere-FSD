#!/usr/bin/env node
/**
 * server/scripts/seed.js
 *
 * Realistic seed script for ServiceSphere-FSD dev database.
 * Uses @faker-js/faker for lorem text; Indian names/addresses use a
 * curated local pool for realism without locale-specific faker installs.
 *
 * Every seeded document carries `seeded: true` (select: false in schema),
 * so existing real test accounts are completely untouched.
 *
 * Usage:
 *   node scripts/seed.js               # additive — keeps all existing data
 *   node scripts/seed.js --clean       # removes only { seeded: true } docs
 *   node scripts/seed.js --reset       # drops ALL collections, then seeds
 *   node scripts/seed.js --reset --yes # same, no confirmation prompt
 */

import '../config/env.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import readline from 'readline';

import { env } from '../config/env.js';
import Location      from '../models/Location.js';
import Category      from '../models/Category.js';
import Service       from '../models/Service.js';
import Admin         from '../models/Admin.js';
import Helper        from '../models/Helper.js';
import Seeker        from '../models/Seeker.js';
import Booking       from '../models/Booking.js';
import Feedback      from '../models/Feedback.js';
import ContactMessage from '../models/ContactMessage.js';

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args  = new Set(process.argv.slice(2));
const CLEAN = args.has('--clean');
const RESET = args.has('--reset');
const YES   = args.has('--yes');

// ─── Password constants ───────────────────────────────────────────────────────
// IMPORTANT: bcrypt cost 4 is intentional for seed-only use.
// All seeded users share a throwaway password, and we hash it ONCE here to
// avoid O(N) bcrypt overhead during bulk insert. Real user signups go through
// the pre-save hook at cost 10. Do NOT change this cost factor elsewhere.
const SEED_COST         = 4;
const SEEKER_PASSWORD   = 'Password123!';
const HELPER_PASSWORD   = 'Password123!';
const MODERATOR_PASSWORD = 'Moderator123!';
const ADMIN_PASSWORD    = 'Admin123!';

// ─── Static reference data ────────────────────────────────────────────────────
const LOCATION_DATA = [
  { name: 'Mumbai',    city: 'Mumbai',    state: 'Maharashtra', status: 'active'            },
  { name: 'Delhi',     city: 'Delhi',     state: 'Delhi',       status: 'active'            },
  { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka',   status: 'active'            },
  { name: 'Pune',      city: 'Pune',      state: 'Maharashtra', status: 'active'            },
  { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana',   status: 'pending_moderator' },
];

const CATEGORIES_DATA = [
  { name: 'Cleaning',         description: 'Home and office cleaning services'            },
  { name: 'Plumbing',         description: 'Plumbing repairs and installations'           },
  { name: 'Electrical',       description: 'Electrical repairs and installations'        },
  { name: 'Beauty',           description: 'Personal care and beauty services'           },
  { name: 'Tutoring',         description: 'Academic tutoring and coaching'              },
  { name: 'Pest Control',     description: 'Pest extermination and prevention'           },
  { name: 'Appliance Repair', description: 'Repair and maintenance of home appliances'  },
  { name: 'Gardening',        description: 'Garden maintenance and landscaping'          },
];

// ~5 services per category = 40 total
const SERVICES_BY_CATEGORY = {
  'Cleaning':         ['Deep House Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Carpet Cleaning', 'Office Cleaning'],
  'Plumbing':         ['Pipe Repair', 'Tap Installation', 'Drain Unblocking', 'Water Heater Service', 'Toilet Repair'],
  'Electrical':       ['Wiring Repair', 'Fan Installation', 'Switch & Socket Repair', 'MCB Replacement', 'AC Electrical Service'],
  'Beauty':           ['Haircut & Styling', 'Facial Treatment', 'Waxing', 'Manicure & Pedicure', 'Bridal Makeup'],
  'Tutoring':         ['Mathematics', 'Science', 'English', 'Competitive Exam Prep', 'Computer Science'],
  'Pest Control':     ['Cockroach Control', 'Termite Treatment', 'Rodent Control', 'Mosquito Fogging', 'Bedbug Treatment'],
  'Appliance Repair': ['Washing Machine Repair', 'Refrigerator Repair', 'Microwave Repair', 'AC Service & Repair', 'TV Repair'],
  'Gardening':        ['Lawn Mowing', 'Tree Trimming', 'Plant Care', 'Garden Design', 'Irrigation Setup'],
};

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Aditya', 'Akash', 'Amara', 'Ananya', 'Anjali', 'Arjun', 'Aryan',
  'Deepa', 'Dhruv', 'Divya', 'Gaurav', 'Ishaan', 'Jaya', 'Karan', 'Kavya',
  'Keerthi', 'Kunal', 'Lakshmi', 'Manav', 'Meera', 'Mihir', 'Mohan', 'Nadia',
  'Nisha', 'Nitin', 'Pooja', 'Priya', 'Rahul', 'Rajesh', 'Ramesh', 'Ravi',
  'Ritika', 'Rohit', 'Sanjay', 'Sanya', 'Sarika', 'Shreya', 'Simran', 'Sneha',
  'Sunita', 'Suresh', 'Tanvi', 'Usha', 'Vijay', 'Vikram', 'Vinita', 'Vishal',
  'Yash', 'Zara',
];

const INDIAN_LAST_NAMES = [
  'Agarwal', 'Bhatia', 'Chakraborty', 'Chaturvedi', 'Chopra', 'Desai', 'Dubey',
  'Gandhi', 'Ghosh', 'Gupta', 'Iyer', 'Jain', 'Joshi', 'Kapoor', 'Khanna',
  'Kumar', 'Mahajan', 'Mehta', 'Mishra', 'Nair', 'Patel', 'Pillai', 'Rao',
  'Reddy', 'Shah', 'Sharma', 'Shukla', 'Singh', 'Sinha', 'Srivastava',
  'Tiwari', 'Trivedi', 'Varma', 'Verma', 'Yadav',
];

const CITY_AREAS = {
  'Mumbai':    ['Linking Road', 'SV Road', 'Andheri East', 'Bandra West', 'Dadar', 'Juhu', 'Malad', 'Borivali'],
  'Delhi':     ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Pitampura'],
  'Bengaluru': ['MG Road', 'Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'JP Nagar', 'Rajajinagar'],
  'Pune':      ['Koregaon Park', 'Aundh', 'Baner', 'Viman Nagar', 'Hadapsar', 'Kothrud', 'Wakad'],
  'Hyderabad': ['Hitech City', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Ameerpet', 'Secunderabad'],
};

const FEEDBACK_TEXTS = [
  'Excellent service! Very professional and punctual.',
  'Good work overall. Very satisfied with the quality.',
  'Average experience, but got the job done.',
  'Not entirely satisfied — work was a bit rushed.',
  'Terrible service, would not recommend.',
  'Outstanding! Went above and beyond expectations.',
  'Showed up on time and completed the work efficiently.',
  'The professional was courteous and skilled. Will hire again.',
  'Could have been more thorough, but acceptable.',
  'Great value for money. Highly recommend.',
  'Friendly and knowledgeable. Explained everything clearly.',
  'Arrived late but made up for it with quality work.',
];

const ISSUE_TYPES = [
  'Booking Issue', 'Payment Problem', 'Helper Complaint',
  'Account Issue', 'Service Quality', 'Other',
];

const COVER_LETTERS = [
  'I have extensive experience in community management and service coordination.',
  'I am passionate about ensuring high-quality service delivery in my area.',
  'With my background in operations, I can effectively moderate this location.',
  'I understand local needs well and can help maintain platform quality.',
];

const EXPERIENCE_STRINGS = [
  '3 years in field operations management',
  '5 years in customer service coordination',
  '7 years in community development',
  '2 years in service platform operations',
  '4 years in local business management',
];

const AVAILABILITIES = ['Weekdays', 'Weekends', 'All Days', 'Flexible', 'Mornings Only', 'Evenings Only'];

// ─── Utility functions ────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function indianName() {
  return `${pick(INDIAN_FIRST_NAMES)} ${pick(INDIAN_LAST_NAMES)}`;
}

function indianMobile() {
  // Indian mobiles start with 6, 7, 8, or 9 then 9 more digits
  return pick(['6', '7', '8', '9']) + String(randInt(100_000_000, 999_999_999));
}

function indianAddress(city) {
  const areas = CITY_AREAS[city] || CITY_AREAS['Mumbai'];
  return `${randInt(1, 999)}, ${pick(areas)}, ${city}`;
}

function randDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatHHMM() {
  const h = String(randInt(7, 19)).padStart(2, '0');
  const m = pick(['00', '15', '30', '45']);
  return `${h}:${m}`;
}

// Booking status distribution: 60% completed, 15% cancelled, 10% confirmed, 10% pending, 5% in_progress
function weightedStatus() {
  const r = Math.random();
  if (r < 0.60) return 'completed';
  if (r < 0.75) return 'cancelled';
  if (r < 0.85) return 'confirmed';
  if (r < 0.95) return 'pending';
  return 'in_progress';
}

// Feedback rating distribution: 40% 5-star, 30% 4-star, 15% 3-star, 10% 2-star, 5% 1-star
function weightedRating() {
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.15) return 2;
  if (r < 0.30) return 3;
  if (r < 0.60) return 4;
  return 5;
}

// ─── Confirmation prompt ──────────────────────────────────────────────────────
async function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === 'y' || a === 'yes');
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log(`\n[seed] Connected to ${env.MONGO_URI}`);

  const ALL_MODELS = [Location, Category, Service, Admin, Helper, Seeker, Booking, Feedback, ContactMessage];

  // ── --reset: drop everything, then fall through to seed ──────────────────────
  if (RESET) {
    if (!YES) {
      console.warn('\n  WARNING: --reset will delete ALL documents, including real test data.');
      const ok = await confirm('  Type "yes" to continue: ');
      if (!ok) {
        console.log('[seed] Aborted.');
        await mongoose.disconnect();
        process.exit(0);
      }
    }
    for (const M of ALL_MODELS) await M.deleteMany({});
    console.log('[seed] All collections cleared.\n');
  }

  // ── --clean: remove only seeded docs, then exit ───────────────────────────────
  if (CLEAN && !RESET) {
    console.log('[seed] Removing seeded documents...');
    for (const M of ALL_MODELS) {
      const { deletedCount } = await M.deleteMany({ seeded: true });
      if (deletedCount > 0) console.log(`  ${M.modelName}: removed ${deletedCount}`);
    }
    console.log('[seed] Clean complete.');
    await mongoose.disconnect();
    return;
  }

  // ── Capture pre-seed counts ───────────────────────────────────────────────────
  const preCounts = {};
  for (const M of ALL_MODELS) preCounts[M.modelName] = await M.countDocuments();

  // ── Hash passwords ONCE at cost 4 (seed-only — see comment at top) ─────────────
  console.log('[seed] Hashing shared passwords at cost 4 (seed-only, intentional)...');
  const [seekerHash, helperHash, moderatorHash, adminHash] = await Promise.all([
    bcrypt.hash(SEEKER_PASSWORD,    SEED_COST),
    bcrypt.hash(HELPER_PASSWORD,    SEED_COST),
    bcrypt.hash(MODERATOR_PASSWORD, SEED_COST),
    bcrypt.hash(ADMIN_PASSWORD,     SEED_COST),
  ]);

  // Unique email counter — use a timestamp run ID so additive runs never collide
  const RUN = Date.now().toString(36);
  let seq = 0;
  const uid = (role) => `seed_${role}_${String(++seq).padStart(4, '0')}_${RUN}@servicesphere.test`;

  // ── 1. Locations ─────────────────────────────────────────────────────────────
  console.log('[seed] 1/9 Seeding locations...');
  const locationDocs = await Location.insertMany(
    LOCATION_DATA.map((l) => ({ ...l, seeded: true }))
  );
  const activeLocations = locationDocs.filter((l) => l.status === 'active');

  // ── 2. Categories ─────────────────────────────────────────────────────────────
  console.log('[seed] 2/9 Seeding categories...');
  const categoryDocs = await Category.insertMany(
    CATEGORIES_DATA.map((c) => ({ ...c, seeded: true }))
  );
  const categoryMap = {};
  for (const cat of categoryDocs) categoryMap[cat.name] = cat;

  // ── 3. Services ───────────────────────────────────────────────────────────────
  console.log('[seed] 3/9 Seeding ~40 services...');
  const serviceRows = [];
  for (const [catName, names] of Object.entries(SERVICES_BY_CATEGORY)) {
    const catId = categoryMap[catName]._id;
    for (const name of names) {
      serviceRows.push({ name, category: catId, isActive: true, seeded: true });
    }
  }
  const insertedServices = await Service.insertMany(serviceRows);

  // Build servicesByCategory for helper assignment
  const servicesByCategory = {}; // categoryId.toString() → Service[]
  for (const svc of insertedServices) {
    const key = svc.category.toString();
    (servicesByCategory[key] ??= []).push(svc);
  }
  const allServiceNames = insertedServices.map((s) => s.name);
  const allCategoryIds  = categoryDocs.map((c) => c._id);

  // ── 4. Moderators ─────────────────────────────────────────────────────────────
  console.log('[seed] 4/9 Seeding 10 moderators (8 active, 2 pending)...');
  const modRows = [];
  const modByLocation = {}; // locationId.toString() → rows[]

  // 2 per active location (4 locations × 2 = 8 active moderators)
  for (const loc of activeLocations) {
    const locKey = loc._id.toString();
    modByLocation[locKey] = [];
    for (let i = 0; i < 2; i++) {
      const row = {
        name:             indianName(),
        email:            uid('mod'),
        password:         moderatorHash,
        role:             'moderator',
        status:           'active',
        assignedLocation: loc._id,
        coverLetter:      pick(COVER_LETTERS),
        experience:       pick(EXPERIENCE_STRINGS),
        applicationDate:  randDate(new Date('2023-01-01'), new Date('2024-01-01')),
        approvedDate:     randDate(new Date('2024-01-01'), new Date('2024-06-01')),
        seeded:           true,
      };
      modRows.push(row);
      modByLocation[locKey].push(row);
    }
  }

  // 2 pending moderators — no assignedLocation (exercises admin pending-applications view)
  for (let i = 0; i < 2; i++) {
    modRows.push({
      name:            indianName(),
      email:           uid('mod'),
      password:        moderatorHash,
      role:            'moderator',
      status:          'pending',
      assignedLocation: null,
      coverLetter:     pick(COVER_LETTERS),
      experience:      pick(EXPERIENCE_STRINGS),
      applicationDate: randDate(new Date('2024-06-01'), new Date()),
      seeded:          true,
    });
  }

  const insertedModerators = await Admin.insertMany(modRows);

  // Backfill Location.moderator → first assigned moderator per location
  for (const loc of activeLocations) {
    const primary = insertedModerators.find(
      (m) => m.assignedLocation?.toString() === loc._id.toString()
    );
    if (primary) await Location.updateOne({ _id: loc._id }, { moderator: primary._id });
  }

  // ── 5. Administrators ──────────────────────────────────────────────────────────
  console.log('[seed] 5/9 Seeding 2 administrators...');
  const adminRows = [1, 2].map(() => ({
    name:             indianName(),
    email:            uid('admin'),
    password:         adminHash,
    role:             'administrator',
    status:           'active',
    assignedLocation: null,
    seeded:           true,
  }));
  const insertedAdmins = await Admin.insertMany(adminRows);

  // ── 6. Helpers (300, spread across 4 active locations ~75 each) ───────────────
  console.log('[seed] 6/9 Seeding 300 helpers...');
  const TOTAL_HELPERS = 300;
  const helperRows = [];

  for (let i = 0; i < TOTAL_HELPERS; i++) {
    const loc    = activeLocations[i % activeLocations.length];
    const catId  = pick(allCategoryIds);
    const svcs   = servicesByCategory[catId.toString()] ?? [];
    // Assign 1–3 services from their category with a custom price
    const helperServices = svcs
      .slice(0, randInt(1, Math.min(3, svcs.length)))
      .map((s) => ({ serviceId: s._id, customPrice: randInt(200, 2000) }));

    helperRows.push({
      name:         indianName(),
      email:        uid('helper'),
      password:     helperHash,
      mobilenumber: indianMobile(),
      aadharnumber: String(randInt(100_000_000_000, 999_999_999_999)),
      gender:       pick(['Male', 'Female', 'Other']),
      address:      indianAddress(loc.city),
      location:     loc._id,
      category:     catId,
      services:     helperServices,
      availability: pick(AVAILABILITIES),
      approved:     Math.random() < 0.70,   // 70% approved
      suspended:    false,
      seeded:       true,
    });
  }

  const insertedHelpers = await Helper.insertMany(helperRows);
  const helperIds  = insertedHelpers.map((h) => h._id);
  // Map helper → location for sanity check later
  const helperLocMap = {}; // helperId.toString() → locationId.toString()
  for (const h of insertedHelpers) {
    helperLocMap[h._id.toString()] = h.location?.toString();
  }

  // ── 7. Seekers (500) ──────────────────────────────────────────────────────────
  console.log('[seed] 7/9 Seeding 500 seekers...');
  const TOTAL_SEEKERS = 500;
  const seekerRows = [];
  const usedMobiles = new Set();

  for (let i = 0; i < TOTAL_SEEKERS; i++) {
    let mobile;
    do { mobile = indianMobile(); } while (usedMobiles.has(mobile));
    usedMobiles.add(mobile);
    const city = pick(Object.keys(CITY_AREAS));
    seekerRows.push({
      name:         indianName(),
      email:        uid('seeker'),
      password:     seekerHash,
      mobilenumber: mobile,
      address:      indianAddress(city),
      suspended:    false,
      seeded:       true,
    });
  }

  const insertedSeekers = await Seeker.insertMany(seekerRows);
  const seekerIds = insertedSeekers.map((s) => s._id);

  // ── 8. Bookings (5 000, last 12 months) ───────────────────────────────────────
  console.log('[seed] 8/9 Seeding 5,000 bookings in batches of 500...');
  const TOTAL_BOOKINGS = 5_000;
  const BATCH_SIZE     = 500;
  const now            = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  // Accumulate completed booking stubs for feedback seeding
  // We only need helper + seeker IDs, not the full doc
  const completedForFeedback = []; // { helper, seeker }

  for (let offset = 0; offset < TOTAL_BOOKINGS; offset += BATCH_SIZE) {
    const batchDocs = [];
    const batchSize = Math.min(BATCH_SIZE, TOTAL_BOOKINGS - offset);

    for (let i = 0; i < batchSize; i++) {
      const status = weightedStatus();
      const bookingDate = randDate(twelveMonthsAgo, now);
      // Completed bookings: paid=true; everything else: paid=false
      const paid = status === 'completed';

      batchDocs.push({
        helper:       pick(helperIds),
        seeker:       pick(seekerIds),
        service_type: pick(allServiceNames),
        date:         bookingDate,
        time:         formatHHMM(),
        address:      indianAddress(pick(Object.keys(CITY_AREAS))),
        status,
        price:        randInt(200, 5_000),
        paid,
        seeded:       true,
      });
    }

    const inserted = await Booking.insertMany(batchDocs);
    inserted.forEach((b, idx) => {
      if (batchDocs[idx].status === 'completed') {
        completedForFeedback.push({ helper: batchDocs[idx].helper, seeker: batchDocs[idx].seeker });
      }
    });
    console.log(`       ${Math.min(offset + BATCH_SIZE, TOTAL_BOOKINGS)}/${TOTAL_BOOKINGS} booked`);
  }

  // ── 9. Feedbacks (2 000, from completed bookings, skewed ratings) ──────────────
  console.log('[seed] 9/9 Seeding up to 2,000 feedbacks...');
  const TOTAL_FEEDBACKS = 2_000;

  // Shuffle completedForFeedback in-place (Fisher-Yates)
  for (let i = completedForFeedback.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [completedForFeedback[i], completedForFeedback[j]] = [completedForFeedback[j], completedForFeedback[i]];
  }

  const feedbackPool = completedForFeedback.slice(0, TOTAL_FEEDBACKS);
  if (feedbackPool.length > 0) {
    const feedbackRows = feedbackPool.map((b) => ({
      seeker:   b.seeker,
      helper:   b.helper,
      feedback: pick(FEEDBACK_TEXTS),
      rating:   weightedRating(),
      seeded:   true,
    }));
    await Feedback.insertMany(feedbackRows);
    console.log(`       ${feedbackRows.length} feedbacks inserted (pool had ${completedForFeedback.length} completed bookings)`);
  } else {
    console.warn('       WARNING: No completed bookings found — zero feedbacks inserted.');
  }

  // ── Contact Messages (200) ────────────────────────────────────────────────────
  console.log('[seed] 9+/9 Seeding 200 contact messages...');
  const allAdminDocs = [
    ...insertedModerators.filter((m) => m.status === 'active'),
    ...insertedAdmins,
  ];
  const contactRows = Array.from({ length: 200 }, () => {
    const name = indianName();
    return {
      name,
      email:     `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      adminId:   pick(allAdminDocs)._id,
      phone:     indianMobile(),
      issueType: pick(ISSUE_TYPES),
      message:   faker.lorem.sentences({ min: 2, max: 4 }),
      seeded:    true,
    };
  });
  await ContactMessage.insertMany(contactRows);

  // ── Sanity checks ─────────────────────────────────────────────────────────────
  console.log('\n[seed] Sanity checks per active location:\n');
  let sanityFailed = false;

  for (const loc of activeLocations) {
    const modCount    = await Admin.countDocuments({ seeded: true, assignedLocation: loc._id, role: 'moderator' });
    const helperCount = await Helper.countDocuments({ seeded: true, location: loc._id });
    const helperIdsInLoc = await Helper.find({ seeded: true, location: loc._id }).select('_id').lean();
    const bookingCount = await Booking.countDocuments({
      seeded:  true,
      helper: { $in: helperIdsInLoc.map((h) => h._id) },
    });

    console.log(`  ${loc.name.padEnd(12)} ${modCount} moderators  ${String(helperCount).padStart(3)} helpers  ${String(bookingCount).padStart(5)} bookings`);

    if (helperCount === 0) {
      console.error(`  FATAL: ${loc.name} has 0 helpers.`);
      sanityFailed = true;
    }
    if (bookingCount === 0) {
      console.error(`  FATAL: ${loc.name} has 0 bookings.`);
      sanityFailed = true;
    }
  }

  if (sanityFailed) {
    console.error('\n[seed] Sanity check FAILED. Fix the seed script before benchmarking.\n');
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Additive summary ──────────────────────────────────────────────────────────
  console.log('\n[seed] Additive counts (pre-existing => after seed):\n');
  for (const M of ALL_MODELS) {
    const after = await M.countDocuments();
    const diff  = after - preCounts[M.modelName];
    console.log(`  ${M.modelName.padEnd(16)} ${String(preCounts[M.modelName]).padStart(5)} => ${String(after).padStart(5)}  (+${diff})`);
  }

  // ── Credentials banner ────────────────────────────────────────────────────────
  console.log(`
+------------------------------------------------------+
|         SEED COMPLETE  --  CREDENTIALS               |
+------------------------------------------------------+
|  Seekers / Helpers    Password123!                   |
|  Moderators           Moderator123!                  |
|  Administrators       Admin123!                      |
|                                                      |
|  All seeded emails:   seed_*@servicesphere.test      |
|  Run ID suffix:       ${RUN.padEnd(28)}|
|  To clean:            npm run seed:clean              |
|  To view emails:      check DB, field seeded:true    |
+------------------------------------------------------+
`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('\n[seed] Fatal error:', err);
  process.exit(1);
});
