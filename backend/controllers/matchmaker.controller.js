import Tutor from '../models/Tutor.js';
import User from '../models/User.js';

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

// @desc    Get AI-powered tutor recommendations
// @route   POST /api/matchmaker/recommend
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const { query, category, skills } = req.body;
    
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Build search query
    const searchQuery = {
      isActive: true,
      'availability.isAvailable': true
    };

    if (category) {
      searchQuery['expertise.category'] = category;
    }

    if (skills && skills.length > 0) {
      searchQuery['expertise.name'] = { $in: skills.map(s => new RegExp(s, 'i')) };
    }

    if (query) {
      searchQuery.$or = [
        { 'expertise.name': { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }

    // Get recommended tutors
    const tutors = await Tutor.find(searchQuery)
      .populate('user', 'displayName email photoURL rating')
      .sort({ 'rating.average': -1, totalSessions: -1 })
      .limit(10);

    // Calculate match scores (simple algorithm for demo)
    const recommendations = tutors.map(tutor => {
      let matchScore = 70; // Base score
      
      // Boost for high rating
      matchScore += tutor.rating.average * 5;
      
      // Boost for experience
      matchScore += Math.min(tutor.totalSessions / 10, 10);
      
      // Boost for verified tutors
      if (tutor.isVerified) matchScore += 5;
      
      // Normalize to 0-100
      matchScore = Math.min(Math.round(matchScore), 100);

      return {
        tutor,
        matchScore,
        reason: `Highly rated ${tutor.expertise[0]?.name || 'tutor'} with ${tutor.totalSessions} completed sessions`
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      data: recommendations,
      query: query || 'general search'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized suggestions based on user interests
// @route   GET /api/matchmaker/suggestions
// @access  Private
export const getPersonalizedSuggestions = async (req, res, next) => {
  try {
    const user = await findOrCreateUser(req.user.uid, req.user.email);

    // Get tutors based on user's interests
    const suggestions = [];

    if (user.interests && user.interests.length > 0) {
      for (const interest of user.interests.slice(0, 3)) {
        const tutors = await Tutor.find({
          isActive: true,
          'availability.isAvailable': true,
          $or: [
            { 'expertise.name': { $regex: interest, $options: 'i' } },
            { bio: { $regex: interest, $options: 'i' } }
          ]
        })
          .populate('user', 'displayName email photoURL rating')
          .sort({ 'rating.average': -1 })
          .limit(2);

        if (tutors.length > 0) {
          suggestions.push({
            category: interest,
            tutors
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};
