import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/jwtUtils.js';
import logger from '../utils/logger.js';

// ── Generic login helper ─────────────────────────────────────────────────────
// req.body is already validated by validate(loginSchema) before this runs.
const loginUser = async ({ Model, role, extraData }, req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Model.findOne({ email });

    // Merge "user not found" and "wrong password" into one response to avoid
    // user-enumeration attacks.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    if (user.suspended) {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    const userData = {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role,
      ...(extraData?.(user) ?? {}),
    };
    const token = generateToken(userData);
    return res.status(200).json({ success: true, token, user: userData });
  } catch (err) {
    logger.error('Login error', { error: err.message, role });
    return res.status(500).json({ error: 'Something went wrong!' });
  }
};

// ── Helper ───────────────────────────────────────────────────────────────────
export const signupHelper = async (req, res) => {
  try {
    const {
      name, email, password, mobilenumber, aadharnumber,
      gender, category, address, location, services,
    } = req.body;

    const emailTaken = await Helper.findOne({ email }) ?? await Seeker.findOne({ email });
    if (emailTaken) return res.status(409).json({ error: 'Email already exists!' });

    const mobileTaken = await Helper.findOne({ mobilenumber }) ?? await Seeker.findOne({ mobilenumber });
    if (mobileTaken) return res.status(409).json({ error: 'Mobile number already registered!' });

    const newHelper = await Helper.create({
      name, email, password,
      mobilenumber, aadharnumber, gender, address, location,
      category, services: services ?? [], approved: false,
    });

    logger.info('Helper registered', { id: newHelper._id });
    return res.status(201).json({ message: 'Helper registered successfully', userId: newHelper._id });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    logger.error('Helper signup error', { error: err.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loginHelper = (req, res) =>
  loginUser({ Model: Helper, role: 'helper' }, req, res);

// ── Seeker ───────────────────────────────────────────────────────────────────
export const signupSeeker = async (req, res) => {
  try {
    const { name, email, password, mobilenumber, address } = req.body;

    const emailTaken = await Helper.findOne({ email }) ?? await Seeker.findOne({ email });
    if (emailTaken) return res.status(409).json({ error: 'Email already exists!' });

    const mobileTaken = await Helper.findOne({ mobilenumber }) ?? await Seeker.findOne({ mobilenumber });
    if (mobileTaken) return res.status(409).json({ error: 'Mobile number already registered!' });

    await Seeker.create({ name, email, password, mobilenumber, address });

    logger.info('Seeker registered');
    return res.status(201).json({ message: 'Seeker registered successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    logger.error('Seeker signup error', { error: err.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loginSeeker = (req, res) =>
  loginUser({
    Model:     Seeker,
    role:      'seeker',
    extraData: (u) => ({ mobilenumber: u.mobilenumber, address: u.address }),
  }, req, res);

// ── Administrator ─────────────────────────────────────────────────────────────
export const signupAdministrator = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    await Admin.create({ name, email, password, role: 'administrator' });

    logger.info('Administrator registered');
    return res.status(201).json({ message: 'Administrator registered successfully' });
  } catch (err) {
    logger.error('Administrator signup error', { error: err.message });
    return res.status(500).json({ error: 'Server Error' });
  }
};

export const loginAdministrator = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(401).json({ error: 'Invalid email or password!' });

    // Moderators share the Admin collection — prevent cross-role login
    if (admin.role !== 'administrator') {
      return res.status(403).json({ error: 'Access denied. Moderators should use the moderator login.' });
    }

    if (!(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    const userData = { id: admin._id, name: admin.name, email: admin.email, role: 'administrator' };
    const token = generateToken(userData);
    return res.status(200).json({ success: true, token, user: userData });
  } catch (err) {
    logger.error('Administrator login error', { error: err.message });
    return res.status(500).json({ error: 'Something went wrong!' });
  }
};
