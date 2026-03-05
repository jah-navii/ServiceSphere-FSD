import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtUtils.js';

//Dealt with

// Helper Signup - API
export const signupHelper = async (req, res) => {
  try {
    // 1. EXTRACT DATA - Added 'category', 'address', and 'location' here
    const { 
        name, 
        email, 
        password, 
        confirmPassword, 
        mobilenumber, 
        aadharnumber, 
        gender, 
        category, // <--- CRITICAL FIX
        address,  // <--- String name of location
        location, // <--- ObjectId reference to Location
        services 
    } = req.body;

    // --- Validations ---
    if (!name || !email || !password || !mobilenumber || !aadharnumber || !category) {
       return res.status(400).json({ error: "All required fields (including Category) must be filled!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }

    // --- Database Checks ---
    const existingEmail = await Helper.findOne({ email }) || await Seeker.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists!" });
    }

    const existingMobile = await Helper.findOne({ mobilenumber }) || await Seeker.findOne({ mobilenumber });
    if (existingMobile) {
      return res.status(409).json({ error: "Mobile number already registered!" });
    }

    // --- Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Create Helper ---
    const newHelper = await Helper.create({ 
        name, 
        email, 
        password: hashedPassword,
        mobilenumber, 
        aadharnumber,
        gender,
        address,
        location, // <--- PASSING THE LOCATION ID HERE
        category, // <--- PASSING THE CATEGORY ID HERE
        services: services || [], // Defaults to empty array if not sent
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

// Seeker Signup - modified for react
export const signupSeeker = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, mobilenumber, address } = req.body;

    // 1. Validations

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

    //2. Database Checks 

    const existingEmail = await Helper.findOne({ email }) || await Seeker.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists!" }); // 409 = Conflict
    }

    const existingMobile = await Helper.findOne({ mobilenumber }) || await Seeker.findOne({ mobilenumber });
    if (existingMobile) {
      return res.status(409).json({ error: "Mobile number already registered!" });
    }

    // --- Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 3. Create User ---
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

// HELPER LOGIN - modified for JWT authentication
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

    // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
    let isPasswordValid = false;
    
    if (helper.password.startsWith('$2a$') || helper.password.startsWith('$2b$')) {
      // Password is hashed, use bcrypt compare
      isPasswordValid = await bcrypt.compare(password, helper.password);
    } else {
      // Legacy plain-text password, direct comparison
      isPasswordValid = (password === helper.password);
      
      // Optionally, update to hashed password for security
      if (isPasswordValid) {
        helper.password = await bcrypt.hash(password, 10);
        await helper.save();
        console.log('Updated helper password to hashed version');
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    const userData = {
      id: helper._id,
      name: helper.name,
      email: helper.email,
      mobilenumber: helper.mobilenumber,
      aadharnumber: helper.aadharnumber,
      gender: helper.gender,
      role: "helper",
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

// --- SEEKER LOGIN (JWT Authentication) ---
export const loginSeeker = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation (Return 400 JSON)
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