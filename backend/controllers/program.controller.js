import Program from '../models/Program.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../middleware/errorHandler.js';

const findOrCreateUser = async (firebaseUid, email) => {
  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = await User.create({
      firebaseUid,
      email,
      displayName: email ? email.split('@')[0] : 'User'
    });
  }
  return user;
};

// POST /api/programs
export const createProgram = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    if (!title || !title.trim()) throw new AppError('Title is required', 400);

    const organizer = await findOrCreateUser(req.user.uid, req.user.email);

    const program = await Program.create({
      title: title.trim(),
      category: category || 'other',
      description: (description || '').trim(),
      organizer: organizer._id
    });

    await program.populate('organizer', 'displayName email');

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// GET /api/programs
export const listPrograms = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isOpen: true };
    if (category) query.category = category;

    const programs = await Program.find(query)
      .populate('organizer', 'displayName email')
      .populate('participants', 'displayName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

// GET /api/programs/joined
export const listJoinedPrograms = async (req, res, next) => {
  try {
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    const programsRaw = await Program.find({
      $or: [
        { participants: user._id },
        { organizer: user._id }
      ]
    })
      .populate('organizer', 'displayName email')
      .populate('participants', 'displayName email')
      .sort({ createdAt: -1 });

    const programs = programsRaw.map((p) => {
      const obj = p.toObject()
      obj.currentUserId = user._id
      obj.currentUserRole = p.organizer.equals(user._id) ? 'organizer' : 'participant'
      return obj
    })

    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

// POST /api/programs/:id/join
export const joinProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id).populate('organizer');
    if (!program) throw new AppError('Program not found', 404);
    if (!program.isOpen) throw new AppError('Program is closed', 400);

    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Prevent duplicate join
    if (program.participants.some(p => p.equals(user._id))) {
      return res.status(200).json({ success: true, data: program });
    }

    program.participants.push(user._id);
    await program.save();

    // Credit organizer rewardHours
    const organizer = await User.findById(program.organizer._id);
    const before = organizer.timeWallet.balance;
    await organizer.updateWallet(program.rewardHours, 'earn');
    const after = organizer.timeWallet.balance;

    // Record transaction as earned (system credit)
    const tx = await Transaction.create({
      type: 'earned',
      from: organizer._id,
      to: organizer._id,
      amount: program.rewardHours,
      session: null,
      skill: program.title,
      description: 'Program join reward',
      status: 'completed',
      balanceBefore: { from: before, to: before },
      balanceAfter: { from: after, to: after },
      metadata: { category: program.category }
    });

    res.status(200).json({ success: true, data: { program, transaction: tx } });
  } catch (error) {
    next(error);
  }
};
