import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  expertise: [{
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['programming', 'languages', 'music', 'design', 'fitness', 'other'],
      required: true
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 0.5,
    default: 1.0 // Rate in hours (time-banking)
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        startTime: String, // Format: "HH:MM"
        endTime: String
      }]
    }]
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
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalSessions: {
    type: Number,
    default: 0
  },
  totalHoursTaught: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
tutorSchema.index({ 'expertise.category': 1 });
tutorSchema.index({ 'availability.isAvailable': 1 });
tutorSchema.index({ 'rating.average': -1 });

// Method to add a review
tutorSchema.methods.addReview = async function(studentId, rating, comment, sessionId) {
  this.reviews.push({
    student: studentId,
    rating,
    comment,
    session: sessionId
  });
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
  
  return this.save();
};

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;
