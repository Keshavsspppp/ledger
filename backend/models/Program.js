import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['programming', 'languages', 'music', 'design', 'fitness', 'other'],
    default: 'other'
  },
  description: { type: String, default: '', maxlength: 1000 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  rewardHours: { type: Number, default: 10, min: 0.5 },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

programSchema.index({ category: 1, isOpen: 1 });
programSchema.index({ organizer: 1, createdAt: -1 });

const Program = mongoose.model('Program', programSchema);
export default Program;
