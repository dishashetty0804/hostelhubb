const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// ============================================
// GET /api/complaints/my – get student's own complaints
// ============================================
router.get('/my', auth, async (req, res) => {
  // Only students can access their complaints
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const complaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 }); // newest first
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// POST /api/complaints – create new complaint (student only)
// ============================================
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { category, description, priority } = req.body;
    // Validate required fields
    if (!category || !description) {
      return res.status(400).json({ message: 'Category and description are required' });
    }
    const complaint = new Complaint({
      student: req.user.id,
      category,
      description,
      priority: priority || 'medium'
    });
    await complaint.save();
    // Return the created complaint (optional)
    res.status(201).json(complaint);
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GET /api/complaints – get all complaints (admin only)
// ============================================
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { category, status } = req.query;
    let filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    const complaints = await Complaint.find(filter)
      .populate('student', 'name email usn roomNumber phoneNumber')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching all complaints:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// PUT /api/complaints/:id – update status (admin only)
// ============================================
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('student', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error('Error updating complaint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;