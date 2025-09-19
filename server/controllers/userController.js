import User from '../models/User.js';

// @desc    Get current user's profile
export const getUserProfile = async (req, res) => {
    // The user object is already attached by the 'protect' middleware
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
};

// @desc    Get the public leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'citizen' })
            .sort({ points: -1 }) // Sort by points descending
            .limit(10) // Get the top 10
            .select('name points'); // Only send public data
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};