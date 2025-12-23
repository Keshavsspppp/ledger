import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'spent', 'adjustment', 'refund'],
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number, // in hours
    required: true,
    min: 0
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  skill: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  balanceBefore: {
    from: {
      type: Number,
      required: true
    },
    to: {
      type: Number,
      required: true
    }
  },
  balanceAfter: {
    from: {
      type: Number,
      required: true
    },
    to: {
      type: Number,
      required: true
    }
  },
  metadata: {
    category: {
      type: String,
      enum: ['programming', 'languages', 'music', 'design', 'fitness', 'other']
    },
    sessionDate: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ session: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1, createdAt: -1 });

// Static method to create transaction from session
transactionSchema.statics.createFromSession = async function(session, fromUser, toUser) {
  const transaction = new this({
    type: session.student.equals(fromUser._id) ? 'spent' : 'earned',
    from: fromUser._id,
    to: toUser._id,
    amount: session.duration,
    session: session._id,
    skill: session.skill,
    description: `Session: ${session.skill}`,
    balanceBefore: {
      from: fromUser.timeWallet.balance,
      to: toUser.timeWallet.balance
    },
    balanceAfter: {
      from: fromUser.timeWallet.balance - session.duration,
      to: toUser.timeWallet.balance + session.duration
    },
    metadata: {
      category: session.category,
      sessionDate: session.scheduledDate
    }
  });

  return transaction.save();
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
