const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      required: [true, 'Please specify user role'],
      enum: {
        values: ['farmer', 'worker'],
        message: 'Role must be either farmer or worker'
      }
    },
    location: {
      type: String,
      required: [true, 'Please specify your location or district'],
      trim: true
    },
    profileImage: {
      type: String,
      default: ''
    },
    // Worker Specific Profile Fields
    skills: {
      type: String,
      default: 'General Agriculture'
    },
    experience: {
      type: String,
      default: '1-3 Years'
    },
    availability: {
      type: String,
      default: 'Full Time'
    },
    preferredRadius: {
      type: String,
      default: '10 km'
    },
    // Farmer Specific Profile Fields
    farmName: {
      type: String,
      default: 'My Farm'
    },
    farmType: {
      type: String,
      default: 'Multi-crop Agriculture'
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
