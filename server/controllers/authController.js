import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';

// Helper Signup - modified for react
export const signupHelper = async (req, res) => {
  try {
    let { name, gender, mobilenumber, aadharnumber, email, password, confirmPassword } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    mobilenumber = mobilenumber?.trim();
    aadharnumber = aadharnumber?.trim();

    if (!name || !gender || !mobilenumber || !aadharnumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match!" });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters long!" });

    if (!/^[A-Za-z\s]+$/.test(name))
      return res.status(400).json({ error: "Name should contain only alphabets!" });

    if (!/^\d{10}$/.test(mobilenumber))
      return res.status(400).json({ error: "Mobile number must be exactly 10 digits!" });

    if (!/^\d{12}$/.test(aadharnumber))
      return res.status(400).json({ error: "Aadhaar number must be exactly 12 digits!" });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "Invalid email format!" });

    const [existingEmail, existingMobile, existingAadhar] = await Promise.all([
      Helper.findOne({ email }) || Seeker.findOne({ email }),
      Helper.findOne({ mobilenumber }) || Seeker.findOne({ mobilenumber }),
      Helper.findOne({ aadharnumber }),
    ]);

    if (existingEmail)
      return res.status(400).json({ error: "Email already exists!" });

    if (existingMobile)
      return res.status(400).json({ error: "Mobile number already registered!" });

    if (existingAadhar)
      return res.status(400).json({ error: "Aadhaar number already registered!" });

    await Helper.create({
      name,
      gender,
      mobilenumber,
      aadharnumber,
      email,
      password,
    });

    console.log(`✅ Helper registered: ${name} (${email})`);
    res.status(201).json({ message: "Helper registered successfully!" });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
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

    // --- 3. Create User ---
    await Seeker.create({ 
        name, 
        email, 
        password, 
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

// HELPER LOGIN - modified for react
export const loginHelper = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  try {
    const helper = await Helper.findOne({ email, password });

    if (!helper) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    const userData = {
      id: helper._id,
      name: helper.name,
      email: helper.email,
      mobilenumber: helper.mobilenumber,
      aadharnumber: helper.aadharnumber,
      gender: helper.gender,
      role: "helper", // Useful for React to know which dashboard to show
    };

    console.log("Helper logged in ✅");
    // Return 200 OK with JSON
    return res.status(200).json({ success: true, user: userData });

  } catch (err) {
    console.error("Helper Login Error:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// --- SEEKER LOGIN (Converted from EJS to React-JSON) ---
export const loginSeeker = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation (Return 400 JSON)
  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  try {
    // ⚠️ SECURITY NOTE: Ideally use bcrypt.compare here too
    const seeker = await Seeker.findOne({ email, password });

    // 2. Auth Check (Return 401 JSON)
    if (!seeker) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    // 3. Construct Data
    const userData = {
      id: seeker._id,
      name: seeker.name,
      email: seeker.email,
      mobilenumber: seeker.mobilenumber,
      address: seeker.address,
      role: "seeker" // Crucial for Frontend logic
    };

    console.log('Seeker logged in ✅');

    // 4. Success Response (Return 200 JSON)
    // REMOVED: req.session (unless you configured CORS for cookies)
    // REMOVED: res.redirect (React will handle navigation)
    return res.status(200).json({ success: true, user: userData });

  } catch (err) {
    console.error("Seeker Login Error:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};