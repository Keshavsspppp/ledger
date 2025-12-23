import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skill: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['programming', 'languages', 'music', 'design', 'fitness', 'other'],
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: 0.5
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetingLink: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: 'Online'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  notes: {
    tutorNotes: {
      type: String,
      maxlength: 500
    },
    studentNotes: {
      type: String,
      maxlength: 500
    }
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      maxlength: 500,
      default: null
    },
    createdAt: {
      type: Date,
      default: null
    }
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: {
      type: String,
      maxlength: 500,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
sessionSchema.index({ tutor: 1, status: 1 });
sessionSchema.index({ student: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1 });
sessionSchema.index({ status: 1 });

// Method to complete session
sessionSchema.methods.completeSession = function() {
  this.status = 'completed';
  return this.save();
};

// Method to cancel session
sessionSchema.methods.cancelSession = function(userId, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy: userId,
    reason,
    cancelledAt: new Date()
  };
  return this.save();
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
