const express = require('express');
const GatePass = require('../models/GatePass.js');
const auth = require('../middleware/auth.js');
const QRCode = require('qrcode');
const User = require('../models/User.js');

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpToPhoneNumber = async (phoneNumber, otp) => {
  // Your AccountSID and Auth Token from console.twilio.com
  const accountSid = process.env.SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = require('twilio')(accountSid, authToken);

  client.messages
    .create({
      body: `By giving this code to your child he can leave the college code: ${otp}`,
      to: `+91${phoneNumber}`, // Text your number
      from: `${process.env.TWILIO_PHONE_NUMBER}`, // From a valid Twilio number
    }).then((message) => console.log(message.sid));
};


// Create gate pass request
router.post('/', auth, async (req, res) => {
  try {
    const gatePass = new GatePass({
      student: req.user._id,
      reason: req.body.reason
    });
    await gatePass.save();
    res.status(201).json(gatePass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get gate passes (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'lecturer') {
      const students = await User.find({ class: req.user.class });
      query.student = { $in: students.map(s => s._id) };
    }
    
    const gatePasses = await GatePass.find(query).populate('student', req.user.role === 'lecturer' ? 'name rollNo' : '');
    res.json(gatePasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a gate pass request (for lecturers)
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ message: 'Only lecturers can approve gate passes.' });
    }

    const gatePass = await GatePass.findById(req.params.id);
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });

    // Generate OTP
    const otp = generateOTP();

    // Update gate pass with OTP
    gatePass.otp = otp;

    // Find the student and retrieve the info
    const student = await User.findById(gatePass.student, 'name class image parentPhone');  // assuming 'User' is your user model
    if (!student) return res.status(404).json({ message: 'Student not found' });

    gatePass.status = 'approved';
    gatePass.responseDate = new Date();

    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // Expires in 1 hour

    // Create the link containing the gatePass ID and expiration time as a query parameter
    const qrLink = `http://localhost:5173/validate-gatepass?id=${gatePass._id}&expiresAt=${expiresAt.toISOString()}`;

    // Store qrData directly in the GatePass document
    gatePass.qrData = {link: qrLink};

    //sending OTP to parent
    await sendOtpToPhoneNumber(student.parentPhone, otp);

    await gatePass.save();

    res.json(gatePass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deny a gate pass request (for lecturers)
router.patch('/:id/deny', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ message: 'Only lecturers can deny gate passes.' });
    }

    const gatePass = await GatePass.findById(req.params.id);
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });

    gatePass.status = 'denied';
    gatePass.responseDate = new Date();
    await gatePass.save();

    res.json(gatePass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Route to validate the gate pass and fetch student details
router.get('/validate-gatepass', async (req, res) => {
  try {
    const { id, expiresAt } = req.query;

    // Check if the expiration date has passed
    const expirationDate = new Date(expiresAt);
    if (new Date() > expirationDate) {
      return res.status(403).json({ message: 'Gate pass has expired' });
    }

    // Find the gate pass by ID
    const gatePass = await GatePass.findById(id);
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });

    // Retrieve student details using the student ID in the gate pass
    const student = await User.findById(gatePass.student, 'name rollNo class image');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Send back the student details if valid
    res.json({
      studentName: student.name,
      rollNo: student.rollNo,
      class: student.class,
      image: student.image,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to verify OTP
router.post('/verify-otp', auth, async (req, res) => {
  const { gatePassId, otp } = req.body;

  try {
    // Find the gate pass by ID
    const gatePass = await GatePass.findById(gatePassId);
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });

    // Check if OTP matches the one stored in the gate pass
    if (gatePass.otp === otp) {
      res.json({ verified: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
