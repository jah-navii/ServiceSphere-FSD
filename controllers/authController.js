import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';

// Helper Signup
export const signupHelper = async (req, res) => {
  const { name, gender, mobilenumber, aadharnumber, email, password, confirmPassword } = req.body;

  // Validations
  if (password !== confirmPassword) {
    return res.render('signup-helper', { error: "Passwords do not match!", name, email, mobilenumber, aadharnumber, gender });
  }
  if (password.length < 6) {
    return res.render('signup-helper', { error: "Password must be at least 6 characters long!", name, email, mobilenumber, aadharnumber, gender });
  }
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.render('signup-helper', { error: "Name should contain only alphabets!", name, email, mobilenumber, aadharnumber, gender });
  }
  if (!/^\d{10}$/.test(mobilenumber)) {
    return res.render('signup-helper', { error: "Mobile number must be exactly 10 digits!", name, email, mobilenumber, aadharnumber, gender });
  }
  if (!/^\d{12}$/.test(aadharnumber)) {
    return res.render('signup-helper', { error: "Aadhaar number must be exactly 12 digits!", name, email, mobilenumber, aadharnumber, gender });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.render('signup-helper', { error: "Invalid email format!", name, email, mobilenumber, aadharnumber, gender });
  }

  try {
    // Check duplicate in both models
    const existingEmail = await Helper.findOne({ email }) || await Seeker.findOne({ email });
    if (existingEmail) {
      return res.render('signup-helper', { error: "Email already exists!", name, email, mobilenumber, aadharnumber, gender });
    }

    const existingMobile = await Helper.findOne({ mobilenumber }) || await Seeker.findOne({ mobilenumber });
    if (existingMobile) {
      return res.render('signup-helper', { error: "Mobile number already registered!", name, email, mobilenumber, aadharnumber, gender });
    }

    const existingAadhar = await Helper.findOne({ aadharnumber });
    if (existingAadhar) {
      return res.render('signup-helper', { error: "Aadhaar number already registered!", name, email, mobilenumber, aadharnumber, gender });
    }

    await Helper.create({ name, gender, mobilenumber, aadharnumber, email, password });
    console.log('Helper registered ✅');
    res.redirect('/login/helper');
  } catch (err) {
    console.error("Signup Error:", err);
    res.render('signup-helper', { error: "Something went wrong!", name, email, mobilenumber, aadharnumber, gender });
  }
};

// Helper Login
export const loginHelper = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login-helper', { error: "Please fill in all fields", email });
  }

  try {
    const helper = await Helper.findOne({ email, password });
    if (!helper) {
      return res.render('login-helper', { error: "Invalid email or password!", email });
    }

    req.session.user = {
      id: helper._id,
      name: helper.name,
      email: helper.email,
      mobilenumber: helper.mobilenumber,
      aadharnumber: helper.aadharnumber,
      gender: helper.gender,
      services: helper.services,
      availability: helper.availability,
      role: "helper"
    };

    console.log('Helper logged in ✅');
    res.redirect('/helper/profile');
  } catch (err) {
    console.error("Login Error:", err);
    res.render('login-helper', { error: "Something went wrong!", email });
  }
};

// Seeker Signup
export const signupSeeker = async (req, res) => {
  const { name, email, password, confirm_password, mobilenumber, address } = req.body;

  // Validations
  if (password !== confirm_password) {
    return res.render('signup-seeker', { error: "Passwords do not match!", name, email, mobilenumber, address });
  }

  if (password.length < 6) {
    return res.render('signup-seeker', { error: "Password must be at least 6 characters!", name, email, mobilenumber, address });
  }

  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.render('signup-seeker', { error: "Name should contain only alphabets!", name, email, mobilenumber, address });
  }

  if (!/^\d{10}$/.test(mobilenumber)) {
    return res.render('signup-seeker', { error: "Mobile number must be 10 digits!", name, email, mobilenumber, address });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.render('signup-seeker', { error: "Invalid email format!", name, email, mobilenumber, address });
  }

  try {
    const existingEmail = await Helper.findOne({ email }) || await Seeker.findOne({ email });
    if (existingEmail) {
      return res.render('signup-seeker', { error: "Email already exists!", name, email, mobilenumber, address });
    }

    const existingMobile = await Helper.findOne({ mobilenumber }) || await Seeker.findOne({ mobilenumber });
    if (existingMobile) {
      return res.render('signup-seeker', { error: "Mobile number already registered!", name, email, mobilenumber, address });
    }

    await Seeker.create({ name, email, password, mobilenumber, address });
    console.log('Seeker registered ✅');
    res.redirect('/login/seeker');
  } catch (err) {
    console.error("Seeker Signup Error:", err);
    res.render('signup-seeker', { error: "Something went wrong!", name, email, mobilenumber, address });
  }
};

// Seeker Login
export const loginSeeker = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login-seeker', { error: "Please fill in all fields", email });
  }

  try {
    const seeker = await Seeker.findOne({ email, password });
    if (!seeker) {
      return res.render('login-seeker', { error: "Invalid email or password!", email });
    }

    req.session.user = {
      id: seeker._id,
      name: seeker.name,
      email: seeker.email,
      mobilenumber: seeker.mobilenumber,
      address: seeker.address,
      role: "seeker"
    };

    console.log('Seeker logged in ✅');
    res.redirect('/home');
  } catch (err) {
    console.error("Seeker Login Error:", err);
    res.render('login-seeker', { error: "Something went wrong!", email });
  }
};
