import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  phone: {
    type: String,
    default: null
  },
  timeWallet: {
    balance: {
      type: Number,
      default: 10.0, // Starting balance in hours
      min: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['programming', 'languages', 'music', 'design', 'fitness', 'other'],
      default: 'other'
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  }],
  interests: [{
    type: String
  }],
  isTutor: {
    type: Boolean,
    default: false
  },
  tutorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    default: null
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ isTutor: 1 });
userSchema.index({ 'skills.category': 1 });

// Virtual for full name if needed
userSchema.virtual('fullName').get(function() {
  return this.displayName;
});

// Method to update time wallet
userSchema.methods.updateWallet = function(amount, type) {
  if (type === 'earn') {
    this.timeWallet.balance += amount;
    this.timeWallet.totalEarned += amount;
  } else if (type === 'spend') {
    this.timeWallet.balance -= amount;
    this.timeWallet.totalSpent += amount;
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
