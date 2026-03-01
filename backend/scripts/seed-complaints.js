// backend/scripts/seed-complaints.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
require('dotenv').config();

const seedComplaints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/hostelhub');
    console.log('✅ Connected to MongoDB');

    let student = await User.findOne({ email: 'student@demo.com' });
    if (!student) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      student = new User({
        name: 'Demo Student',
        email: 'student@demo.com',
        password: hashedPassword,
        role: 'student',
        usn: 'DEMO001',
        roomNumber: '101',
        phoneNumber: '9876543210'
      });
      await student.save();
      console.log('✅ Demo student created');
    } else {
      console.log('ℹ️ Demo student already exists');
    }

    await Complaint.deleteMany({});
    console.log('🗑️ Cleared existing complaints');

    const complaints = [
      {
        student: student._id,
        category: 'plumbing',
        description: 'Leaking tap in bathroom. Water dripping constantly.',
        priority: 'high',
        status: 'pending',
        createdAt: new Date('2026-02-25T10:30:00')
      },
      {
        student: student._id,
        category: 'electrical',
        description: 'Tube light not working in room. Facing difficulty studying.',
        priority: 'medium',
        status: 'in-progress',
        createdAt: new Date('2026-02-26T14:15:00')
      },
      {
        student: student._id,
        category: 'carpentry',
        description: 'Broken chair in study table. One leg is loose.',
        priority: 'low',
        status: 'resolved',
        createdAt: new Date('2026-02-24T09:45:00')
      },
      {
        student: student._id,
        category: 'cleaning',
        description: 'Room not cleaned properly. Dust under bed.',
        priority: 'medium',
        status: 'pending',
        createdAt: new Date('2026-02-27T11:20:00')
      },
      {
        student: student._id,
        category: 'electrical',
        description: 'Fan regulator not working. Fan runs at full speed only.',
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date('2026-02-26T16:30:00')
      }
    ];

    await Complaint.insertMany(complaints);
    console.log(`✅ Added ${complaints.length} default complaints`);

    const counts = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    console.log('\n📊 Complaint summary:');
    counts.forEach(item => console.log(`   ${item._id}: ${item.count}`));

  } catch (error) {
    console.error('❌ Error seeding complaints:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedComplaints();