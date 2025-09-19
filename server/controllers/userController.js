import User from '../models/User.js';
import Report from '../models/Report.js';
import { calculateRank, getBadgeDetails } from '../services/gamificationService.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Calculate basic stats
    const reportsSubmitted = await Report.countDocuments({ reporterId: user._id });
    const reportsResolved = await Report.countDocuments({ reporterId: user._id, status: 'resolved' });
    
    // 2. Calculate total upvotes received using aggregation
    const upvoteData = await Report.aggregate([
      { $match: { reporterId: user._id } },
      { $group: { _id: null, totalUpvotes: { $sum: '$upvoteCount' } } }
    ]);
    const upvotesReceived = upvoteData.length > 0 ? upvoteData[0].totalUpvotes : 0;

    // 3. Get rank and progress info from our service
    const rankInfo = calculateRank(user.points);

    // 4. Get full badge details from our service
    const badgeDetails = getBadgeDetails(user.badges);

    // 5. Assemble the complete profile object
    const profileData = {
      name: user.name,
      points: user.points,
      rank: rankInfo.rank,
      pointsToNextRank: rankInfo.pointsToNextRank,
      stats: {
        reportsSubmitted,
        reportsResolved,
        upvotesReceived,
      },
      badges: badgeDetails,
    };
    
    res.json(profileData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ... (getLeaderboard function remains the same)

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