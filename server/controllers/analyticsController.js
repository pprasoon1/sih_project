import Report from '../models/Report.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    const statusCounts = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalReports,
      resolvedReports,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getChartData = async (req, res) => {
  try {
    const reportsByCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const avgResolutionTime = await Report.aggregate([
        { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
        { 
            $project: { 
                resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] } 
            } 
        },
        { 
            $group: { 
                _id: null, 
                avgTime: { $avg: '$resolutionTime' } 
            } 
        }
    ]);
    
    const avgHours = avgResolutionTime.length > 0 ? (avgResolutionTime[0].avgTime / 1000 / 60 / 60) : 0;

    res.json({
      reportsByCategory,
      avgResolutionTime: avgHours.toFixed(2)
    });
  } catch (error) {
     res.status(500).json({ message: "Server Error" });
  }
};