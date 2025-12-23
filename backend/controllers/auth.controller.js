import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get or create user from Firebase auth
// @route   POST /api/auth/verify
// @access  Public
export const verifyUser = async (req, res, next) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    // Check if user exists
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Create new user
      user = await User.create({
        firebaseUid,
        email,
        displayName,
        photoURL
      });
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .populate('tutorProfile');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
