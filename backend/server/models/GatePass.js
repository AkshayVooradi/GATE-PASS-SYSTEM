const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  responseDate: { type: Date },
  qrData: { 
    type: Map, // Can store key-value pairs as an object
    of: String,
  },
  otp: String
}, {
  timestamps: true
});

module.exports = mongoose.model('GatePass', gatePassSchema);
