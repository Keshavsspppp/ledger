import Session from '../models/Session.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../middleware/errorHandler.js';

// Ensure a User doc exists for the authenticated Firebase uid
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

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, upcoming } = req.query;
    
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    const query = {
      $or: [
        { tutor: user._id },
        { student: user._id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const sessions = await Session.find(query)
      .populate('tutor', 'displayName email photoURL')
      .populate('student', 'displayName email photoURL')
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('tutor', 'displayName email photoURL')
      .populate('student', 'displayName email photoURL')
      .populate('transaction');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create session (book a tutor)
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res, next) => {
  try {
    const { tutorId, skill, category, duration, scheduledDate, scheduledTime, description } = req.body;

    const student = await findOrCreateUser(req.user.uid, req.user.email);

    const tutor = await User.findById(tutorId);
    
    if (!tutor || !tutor.isTutor) {
      throw new AppError('Tutor not found', 404);
    }

    // Check if student has enough balance
    if (student.timeWallet.balance < duration) {
      throw new AppError('Insufficient time wallet balance', 400);
    }

    // Create session
    const session = await Session.create({
      tutor: tutorId,
      student: student._id,
      skill,
      category,
      duration,
      scheduledDate,
      scheduledTime,
      description,
      status: 'pending'
    });

    await session.populate('tutor', 'displayName email photoURL');
    await session.populate('student', 'displayName email photoURL');

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a session (pending)
// @route   POST /api/sessions/request
// @access  Private
export const requestSession = async (req, res, next) => {
  try {
    const { tutorId, skill, message } = req.body;

    if (!tutorId) {
      throw new AppError('Tutor ID is required', 400);
    }
    if (!skill || !skill.trim()) {
      throw new AppError('Skill is required', 400);
    }

    const student = await findOrCreateUser(req.user.uid, req.user.email);
    const tutor = await User.findById(tutorId);

    if (!tutor || !tutor.isTutor) {
      throw new AppError('Tutor not found', 404);
    }

    const session = await Session.create({
      tutor: tutorId,
      student: student._id,
      skill,
      category: 'other',
      duration: 1,
      scheduledDate: new Date(),
      scheduledTime: '00:00',
      description: message || 'Session request',
      status: 'pending'
    });

    await session.populate('tutor', 'displayName email photoURL');
    await session.populate('student', 'displayName email photoURL');

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('tutor')
      .populate('student');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Check if user is part of this session
    if (!session.tutor._id.equals(user._id) && !session.student._id.equals(user._id)) {
      throw new AppError('Unauthorized to update this session', 403);
    }

    const { status, meetingLink, notes } = req.body;

    if (status) session.status = status;
    if (meetingLink) session.meetingLink = meetingLink;
    if (notes) session.notes = { ...session.notes, ...notes };

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete session
// @route   POST /api/sessions/:id/complete
// @access  Private
export const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('tutor')
      .populate('student');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Only tutor can complete session
    if (!session.tutor._id.equals(user._id)) {
      throw new AppError('Only tutor can complete the session', 403);
    }

    if (session.status === 'completed') {
      throw new AppError('Session already completed', 400);
    }

    // Complete session
    await session.completeSession();

    // Create transaction
    const transaction = await Transaction.createFromSession(
      session,
      session.student,
      session.tutor
    );

    // Update wallets
    await session.student.updateWallet(session.duration, 'spend');
    await session.tutor.updateWallet(session.duration, 'earn');

    session.transaction = transaction._id;
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        session,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel session
// @route   POST /api/sessions/:id/cancel
// @access  Private
export const cancelSession = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const session = await Session.findById(req.params.id)
      .populate('tutor')
      .populate('student');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Check if user is part of this session
    if (!session.tutor._id.equals(user._id) && !session.student._id.equals(user._id)) {
      throw new AppError('Unauthorized to cancel this session', 403);
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new AppError('Cannot cancel this session', 400);
    }

    await session.cancelSession(user._id, reason);

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to session
// @route   POST /api/sessions/:id/review
// @access  Private
export const addSessionReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    const session = await Session.findById(req.params.id)
      .populate('student');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    // Only student can review
    if (!session.student._id.equals(user._id)) {
      throw new AppError('Only student can review the session', 403);
    }

    if (session.status !== 'completed') {
      throw new AppError('Can only review completed sessions', 400);
    }

    session.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};
