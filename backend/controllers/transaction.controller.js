import Transaction from '../models/Transaction.js';
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

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    const query = {
      $or: [
        { from: user._id },
        { to: user._id }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('from', 'displayName email photoURL')
      .populate('to', 'displayName email photoURL')
      .populate('session', 'skill scheduledDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('from', 'displayName email photoURL')
      .populate('to', 'displayName email photoURL')
      .populate('session');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Check if user is part of this transaction
    if (!transaction.from.equals(user._id) && !transaction.to.equals(user._id)) {
      throw new AppError('Unauthorized to view this transaction', 403);
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res, next) => {
  try {
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    const earned = await Transaction.aggregate([
      {
        $match: {
          to: user._id,
          status: 'completed',
          type: 'earned'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const spent = await Transaction.aggregate([
      {
        $match: {
          from: user._id,
          status: 'completed',
          type: 'spent'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      earned: {
        total: earned[0]?.total || 0,
        count: earned[0]?.count || 0
      },
      spent: {
        total: spent[0]?.total || 0,
        count: spent[0]?.count || 0
      },
      balance: user.timeWallet.balance,
      netFlow: (earned[0]?.total || 0) - (spent[0]?.total || 0)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a manual transaction (earn/spend)
// @route   POST /api/transactions/manual
// @access  Private
export const createManualTransaction = async (req, res, next) => {
  try {
    const { type, amount, skill, description } = req.body;

    if (!['earned', 'spent'].includes(type)) {
      throw new AppError('Type must be earned or spent', 400);
    }
    const hours = parseFloat(amount);
    if (!hours || hours <= 0) {
      throw new AppError('Amount must be a positive number', 400);
    }
    const skillName = (skill || '').trim();
    if (!skillName) {
      throw new AppError('Skill is required', 400);
    }

    const user = await findOrCreateUser(req.user.uid, req.user.email);

    const before = user.timeWallet.balance;
    if (type === 'spent' && before < hours) {
      throw new AppError('Insufficient balance', 400);
    }

    // Update wallet first
    await user.updateWallet(hours, type === 'earned' ? 'earn' : 'spend');
    const after = user.timeWallet.balance;

    // Create transaction record; from/to are the same user for manual entries
    const tx = await Transaction.create({
      type,
      from: user._id,
      to: user._id,
      amount: hours,
      session: null,
      skill: skillName,
      description: description || (type === 'earned' ? 'Manual earning' : 'Manual spending'),
      status: 'completed',
      balanceBefore: { from: before, to: before },
      balanceAfter: { from: after, to: after },
      metadata: { category: 'other' }
    });

    res.status(201).json({ success: true, data: tx });
  } catch (error) {
    next(error);
  }
};

// @desc    Export ledger as PDF placeholder (stub)
// @route   GET /api/transactions/export
// @access  Private
export const exportTransactions = async (req, res, next) => {
  try {
    // Stub: In a real implementation, generate PDF here.
    res.status(200).json({ success: true, message: 'Export coming soon' });
  } catch (error) {
    next(error);
  }
};
