import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const createUserRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('displayName').trim().notEmpty().withMessage('Display name is required'),
  body('firebaseUid').notEmpty().withMessage('Firebase UID is required')
];

export const updateUserRules = [
  body('displayName').optional().trim().notEmpty(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('phone').optional().trim()
];

// Tutor validation rules
export const createTutorRules = [
  body('expertise').isArray({ min: 1 }).withMessage('At least one expertise is required'),
  body('expertise.*.name').notEmpty().withMessage('Expertise name is required'),
  body('expertise.*.category').isIn(['programming', 'languages', 'music', 'design', 'fitness', 'other']),
  body('hourlyRate').isFloat({ min: 0.5 }).withMessage('Hourly rate must be at least 0.5 hours'),
  body('bio').trim().notEmpty().isLength({ max: 1000 }).withMessage('Bio is required (max 1000 characters)')
];

// Session validation rules
export const createSessionRules = [
  body('tutorId').notEmpty().withMessage('Tutor ID is required'),
  body('skill').trim().notEmpty().withMessage('Skill is required'),
  body('category').isIn(['programming', 'languages', 'music', 'design', 'fitness', 'other']),
  body('duration').isFloat({ min: 0.5 }).withMessage('Duration must be at least 0.5 hours'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)')
];

// Review validation rules
export const createReviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 })
];

// ID parameter validation
export const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
