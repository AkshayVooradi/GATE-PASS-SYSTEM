const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'lecturer', 'admin'],
    required: true
  },
  class: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'lecturer';
    }
  },
  rollNo: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  image: {
    type: String,
    required: false
  },
  parentPhone: {
    type: String,
    required: function() {
      return this.role === 'student'; // Only required if the user is a student
    }
  }
}, {
  timestamps: true
});

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
