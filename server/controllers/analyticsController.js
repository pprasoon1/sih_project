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

    const reportsByStatusRaw = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    // Map to UI-expected keys
    const statusMap = reportsByStatusRaw.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {});
    const reportsByStatus = [
      { _id: 'pending', count: (statusMap['new'] || 0) + (statusMap['acknowledged'] || 0) },
      { _id: 'in-progress', count: statusMap['in_progress'] || 0 },
      { _id: 'resolved', count: statusMap['resolved'] || 0 },
      { _id: 'closed', count: 0 },
    ];
    
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
      reportsByStatus,
      avgResolutionTime: avgHours.toFixed(2)
    });
  } catch (error) {
     res.status(500).json({ message: "Server Error" });
  }
};

// Extended analytics: departments, status by dept, geo heat bins
export const getExtendedAnalytics = async (req, res) => {
  try {
    const perDepartment = await Report.aggregate([
      { $match: { assignedDept: { $exists: true, $ne: null } } },
      { $group: { _id: '$assignedDept', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusByDepartment = await Report.aggregate([
      { $match: { assignedDept: { $exists: true, $ne: null } } },
      { $group: { _id: { dept: '$assignedDept', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Join department names
    // This small lookup avoids a second roundtrip on the client
    const deptIds = perDepartment.map(d => d._id);
    const Department = (await import('../models/Department.js')).default;
    const depts = await Department.find({ _id: { $in: deptIds } }).select('name');
    const deptNameMap = depts.reduce((acc, d) => { acc[d._id.toString()] = d.name; return acc; }, {});

    const perDepartmentNamed = perDepartment.map(d => ({
      departmentId: d._id,
      name: deptNameMap[d._id.toString()] || 'Unknown',
      count: d.count,
    }));

    // Geo heat bins: round lng/lat to 2 decimal places (~1.1km)
    const heatBins = await Report.aggregate([
      { $project: { lng: { $arrayElemAt: ['$location.coordinates', 0] }, lat: { $arrayElemAt: ['$location.coordinates', 1] } } },
      { $project: { lngBin: { $round: ['$lng', 2] }, latBin: { $round: ['$lat', 2] } } },
      { $group: { _id: { lng: '$lngBin', lat: '$latBin' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 200 }
    ]);

    res.json({ perDepartment: perDepartmentNamed, statusByDepartment, heatBins });
  } catch (error) {
    console.error('Extended analytics error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
