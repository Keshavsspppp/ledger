import Tutor from '../models/Tutor.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Public
export const getTutors = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      available,
      minRating,
      sortBy = '-rating.average'
    } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query['expertise.category'] = category;
    }
    
    if (available === 'true') {
      query['availability.isAvailable'] = true;
    }
    
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }
    
    if (search) {
      query.$or = [
        { 'expertise.name': { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const tutors = await Tutor.find(query)
      .populate('user', 'displayName email photoURL rating')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Tutor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tutors,
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

// @desc    Get tutor by ID
// @route   GET /api/tutors/:id
// @access  Public
export const getTutorById = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('user', 'displayName email photoURL rating')
      .populate('reviews.student', 'displayName photoURL');

    if (!tutor) {
      throw new AppError('Tutor not found', 404);
    }

    res.status(200).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create tutor profile
// @route   POST /api/tutors
// @access  Private
export const createTutor = async (req, res, next) => {
  try {
    const { expertise, hourlyRate, bio, availability } = req.body;

    // Get user from Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user already has a tutor profile
    if (user.isTutor) {
      throw new AppError('User already has a tutor profile', 400);
    }

    // Create tutor profile
    const tutor = await Tutor.create({
      user: user._id,
      expertise,
      hourlyRate,
      bio,
      availability: availability || { isAvailable: true, schedule: [] }
    });

    // Update user
    user.isTutor = true;
    user.tutorProfile = tutor._id;
    await user.save();

    await tutor.populate('user', 'displayName email photoURL');

    res.status(201).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tutor profile
// @route   PUT /api/tutors/:id
// @access  Private
export const updateTutor = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id).populate('user');

    if (!tutor) {
      throw new AppError('Tutor not found', 404);
    }

    // Check if user owns this tutor profile
    if (tutor.user.firebaseUid !== req.user.uid) {
      throw new AppError('Unauthorized to update this profile', 403);
    }

    const { expertise, hourlyRate, bio, availability } = req.body;

    if (expertise) tutor.expertise = expertise;
    if (hourlyRate) tutor.hourlyRate = hourlyRate;
    if (bio) tutor.bio = bio;
    if (availability) tutor.availability = availability;

    await tutor.save();

    res.status(200).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to tutor
// @route   POST /api/tutors/:id/reviews
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment, sessionId } = req.body;

    const tutor = await Tutor.findById(req.params.id);
    
    if (!tutor) {
      throw new AppError('Tutor not found', 404);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    await tutor.addReview(user._id, rating, comment, sessionId);

    res.status(201).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tutor reviews
// @route   GET /api/tutors/:id/reviews
// @access  Public
export const getTutorReviews = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .select('reviews')
      .populate('reviews.student', 'displayName photoURL');

    if (!tutor) {
      throw new AppError('Tutor not found', 404);
    }

    res.status(200).json({
      success: true,
      data: tutor.reviews
    });
  } catch (error) {
    next(error);
  }
};
