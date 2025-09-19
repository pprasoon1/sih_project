import Report from '../models/Report.js';
import cron from 'node-cron';

const calculateScores = async () => {
    console.log('Running scheduled job: Calculating Civic Health Scores...');
    try {
        const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

        // This is a simplified example. A real implementation would group by geographic zones.
        const scores = await Report.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: '$category',
                    unresolved_count: {
                        $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] }
                    },
                    total_reports: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: '$_id',
                    healthScore: {
                        $subtract: [100, {
                            $multiply: [{ $divide: ['$unresolved_count', '$total_reports'] }, 100]
                        }]
                    }
                }
            }
        ]);

        console.log('Health Scores Calculated:', scores);
        // In a real app, you would save these scores to a `CivicHealthZone` collection.
    } catch (error) {
        console.log('Error calculating health scores:', error);
    }
};

// Schedule the job to run once every day at midnight
export const scheduleHealthScoreJob = () => {
    cron.schedule('0 0 * * *', calculateScores);
};