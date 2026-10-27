const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    userImage: {
      type: String,
      maxlength: [500, 'Image path cannot exceed 500 characters'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
    },
    accountDeletion: {
      requested: {
        type: Boolean,
        default: false,
      },
      requestedAt: {
        type: Date,
      },
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      required: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
      match: [/^\d{10,15}$/, 'Please enter a valid phone number'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetOTP: {
      type: Number,
      select: false,
    },
    resetOTPExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// 🔁 Ensure both email and phone are provided
userSchema.pre('validate', function (next) {
  if (!this.email) {
    this.invalidate('email', 'Email is required.');
  }
  if (!this.phone) {
    this.invalidate('phone', 'Phone number is required.');
  }
  next();
});

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10); // Salt rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Add method to compare password (for login)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
