import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtUtils.js';

// Helper Signup 
export const signupHelper = async (req, res) => {
  try {
    const { 
        name, 
        email, 
        password, 
        confirmPassword, 
        mobilenumber, 
        aadharnumber, 
        gender, 
        category, 
        address,  
        location, 
        services 
    } = req.body;

    // Validations
    if (!name || !email || !password || !mobilenumber || !aadharnumber || !category) {
       return res.status(400).json({ error: "All required fields (including Category) must be filled!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }

    // Database Checks
    const existingEmail = await Helper.findOne({ email }) || await Seeker.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists!" });
    }

    const existingMobile = await Helper.findOne({ mobilenumber }) || await Seeker.findOne({ mobilenumber });
    if (existingMobile) {
      return res.status(409).json({ error: "Mobile number already registered!" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Helper
    const newHelper = await Helper.create({ 
        name, 
        email, 
        password: hashedPassword,
        mobilenumber, 
        aadharnumber,
        gender,
        address,
        location, 
        category, 
        services: services || [], 
        approved: false 
    });

    console.log('Helper registered ✅', newHelper._id);
    
    return res.status(201).json({ message: "Helper registered successfully", userId: newHelper._id });

  } catch (err) {
    console.error("❌ Signup Error:", err);
    
    // Send a clear error message back to React
    if (err.name === 'ValidationError') {
        // Extract the specific message (e.g., "Path `category` is required")
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ error: messages[0] });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Seeker Signup
export const signupSeeker = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, mobilenumber, address } = req.body;

    // Validations

    if (!name || !email || !password || !mobilenumber) {
       return res.status(400).json({ error: "All required fields must be filled!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters!" });
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ error: "Name should contain only alphabets!" });
    }

    if (!/^\d{10}$/.test(mobilenumber)) {
      return res.status(400).json({ error: "Mobile number must be 10 digits!" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format!" });
    }

    // Database Checks 

    const existingEmail = await Helper.findOne({ email }) || await Seeker.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists!" }); // 409 = Conflict
    }

    const existingMobile = await Helper.findOne({ mobilenumber }) || await Seeker.findOne({ mobilenumber });
    if (existingMobile) {
      return res.status(409).json({ error: "Mobile number already registered!" });
    }

    // Hash Password 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Seeker
    await Seeker.create({ 
        name, 
        email, 
        password: hashedPassword, 
        mobilenumber, 
        address 
    });

    console.log('Seeker registered ✅');

    return res.status(201).json({ message: "Seeker registered successfully" });

  } catch (err) {
    console.error("Seeker Signup Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper Login
export const loginHelper = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  try {
    const helper = await Helper.findOne({ email });

    if (!helper) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    // Check if password is hashed
    let isPasswordValid = false;
    
    if (helper.password.startsWith('$2a$') || helper.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, helper.password);
    } else {
      isPasswordValid = (password === helper.password);
      
      if (isPasswordValid) {
        helper.password = await bcrypt.hash(password, 10);
        await helper.save();
        console.log('Updated helper password to hashed version');
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    if (helper.suspended) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
    }

    const userData = {
      id: helper._id,
      name: helper.name,
      email: helper.email,
      role: "helper"
    };

    // Generate JWT token
    const token = generateToken(userData);

    console.log("Helper logged in ✅");
    
    // Return token and user data
    return res.status(200).json({ 
      success: true, 
      token,
      user: userData 
    });

  } catch (err) {
    console.error("Helper Login Error:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// Seeker Login
export const loginSeeker = async (req, res) => {
  const { email, password } = req.body;

  // Validation 
  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  try {
    const seeker = await Seeker.findOne({ email });

    // 2. Auth Check (Return 401 JSON)
    if (!seeker) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
    let isPasswordValid = false;
    
    if (seeker.password.startsWith('$2a$') || seeker.password.startsWith('$2b$')) {
      // Password is hashed, use bcrypt compare
      isPasswordValid = await bcrypt.compare(password, seeker.password);
    } else {
      // Legacy plain-text password, direct comparison
      isPasswordValid = (password === seeker.password);
      
      // Optionally, update to hashed password for security
      if (isPasswordValid) {
        seeker.password = await bcrypt.hash(password, 10);
        await seeker.save();
        console.log('Updated seeker password to hashed version');
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    if (seeker.suspended) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
    }

    // 3. Construct Data
    const userData = {
      id: seeker._id,
      name: seeker.name,
      email: seeker.email,
      mobilenumber: seeker.mobilenumber,
      address: seeker.address,
      role: "seeker"
    };

    // Generate JWT token
    const token = generateToken(userData);

    console.log('Seeker logged in ✅');

    // 5. Success Response with token
    return res.status(200).json({ 
      success: true, 
      token,
      user: userData 
    });

  } catch (err) {
    console.error("Seeker Login Error:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// Administrator Signup
export const signupAdministrator = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashedPassword, role: 'administrator' });

    return res.status(201).json({ message: 'Administrator registered successfully' });
  } catch (err) {
    console.error('Administrator Signup Error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// Administrator Login
export const loginAdministrator = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    // Only administrators can login here — moderators use /api/auth/login/moderator
    if (admin.role !== 'administrator') {
      return res.status(403).json({ error: 'Access denied. Moderators should use the moderator login.' });
    }

    let isPasswordValid = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      isPasswordValid = (password === admin.password);
      if (isPasswordValid) {
        admin.password = await bcrypt.hash(password, 10);
        await admin.save();
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    const userData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'administrator',
    };

    const token = generateToken(userData);

    console.log('Administrator logged in ✅');

    return res.status(200).json({ success: true, token, user: userData });
  } catch (err) {
    console.error('Administrator Login Error:', err);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
};