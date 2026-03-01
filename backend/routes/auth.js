const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Complaint = require('../models/Complaint'); // for complaint counts
const auth = require('../middleware/auth');

// ==================== STUDENT REGISTRATION ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, usn, roomNumber, phoneNumber } = req.body;

    if (!name || !email || !password || !usn || !roomNumber || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role: 'student', usn, roomNumber, phoneNumber });
    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ADMIN CREATION ====================
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-2026';

    if (secretKey !== ADMIN_SECRET) return res.status(403).json({ message: 'Invalid secret key' });
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role: 'admin' });
    await user.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET ALL STUDENTS (basic) – ADMIN ONLY ====================
router.get('/students', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const students = await User.find({ role: 'student' }).select('name email -_id').sort({ name: 1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET STUDENTS WITH COMPLAINT COUNTS – ADMIN ONLY ====================
router.get('/students-with-counts', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const students = await User.find({ role: 'student' }).select('name email');
    const studentsWithCounts = await Promise.all(students.map(async (student) => {
      const count = await Complaint.countDocuments({ student: student._id });
      return {
        name: student.name,
        email: student.email,
        complaints: count
      };
    }));
    res.json(studentsWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET CURRENT USER ====================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;