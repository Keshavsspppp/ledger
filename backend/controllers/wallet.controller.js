import User from '../models/User.js';
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

// @desc    Get wallet balance
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req, res, next) => {
  try {
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    res.status(200).json({
      success: true,
      data: user.timeWallet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust wallet balance (admin only - for demo purposes)
// @route   POST /api/wallet/adjust
// @access  Private
export const adjustWallet = async (req, res, next) => {
  try {
    const { amount, type } = req.body;
    
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    if (type === 'add') {
      user.timeWallet.balance += amount;
    } else if (type === 'subtract') {
      if (user.timeWallet.balance < amount) {
        throw new AppError('Insufficient balance', 400);
      }
      user.timeWallet.balance -= amount;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.timeWallet
    });
  } catch (error) {
    next(error);
  }
};
