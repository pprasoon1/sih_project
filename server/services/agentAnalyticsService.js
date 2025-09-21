import Report from '../models/Report.js';
import User from '../models/User.js';

/**
 * Agent Analytics Service
 * Provides comprehensive analytics for agent workflow usage and performance
 */
class AgentAnalyticsService {
  
  /**
   * Get overall agent usage statistics
   */
  async getOverallStats() {
    try {
      const totalReports = await Report.countDocuments();
      const agentReports = await Report.countDocuments({
        'metadata.processingMethod': 'agentic'
      });
      const manualReports = totalReports - agentReports;

      const agentUsageRate = totalReports > 0 ? (agentReports / totalReports) * 100 : 0;

      return {
        totalReports,
        agentReports,
        manualReports,
        agentUsageRate: Math.round(agentUsageRate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      throw error;
    }
  }

  /**
   * Get agent usage trends over time
   */
  async getUsageTrends(timeframe = '30d') {
    try {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const reports = await Report.find({
        createdAt: { $gte: startDate }
      }).select('createdAt metadata.processingMethod category');

      // Group by day
      const dailyStats = {};
      const currentDate = new Date(startDate);
      
      while (currentDate <= now) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyStats[dateKey] = {
          date: dateKey,
          total: 0,
          agent: 0,
          manual: 0,
          categories: {}
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Populate stats
      reports.forEach(report => {
        const dateKey = report.createdAt.toISOString().split('T')[0];
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].total++;
          
          if (report.metadata?.processingMethod === 'agentic') {
            dailyStats[dateKey].agent++;
          } else {
            dailyStats[dateKey].manual++;
          }
          
          // Category breakdown
          if (!dailyStats[dateKey].categories[report.category]) {
            dailyStats[dateKey].categories[report.category] = 0;
          }
          dailyStats[dateKey].categories[report.category]++;
        }
      });

      return Object.values(dailyStats);
    } catch (error) {
      console.error('Error getting usage trends:', error);
      throw error;
    }
  }

  /**
   * Get category analysis for agent vs manual reports
   */
  async getCategoryAnalysis() {
    try {
      const agentCategoryStats = await Report.aggregate([
        { $match: { 'metadata.processingMethod': 'agentic' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const manualCategoryStats = await Report.aggregate([
        { $match: { 'metadata.processingMethod': { $ne: 'agentic' } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const allCategories = [...new Set([
        ...agentCategoryStats.map(s => s._id),
        ...manualCategoryStats.map(s => s._id)
      ])];

      const categoryComparison = allCategories.map(category => {
        const agentCount = agentCategoryStats.find(s => s._id === category)?.count || 0;
        const manualCount = manualCategoryStats.find(s => s._id === category)?.count || 0;
        const total = agentCount + manualCount;
        
        return {
          category,
          agentCount,
          manualCount,
          total,
          agentPercentage: total > 0 ? Math.round((agentCount / total) * 100) : 0
        };
      });

      return categoryComparison.sort((a, b) => b.total - a.total);
    } catch (error) {
      console.error('Error getting category analysis:', error);
      throw error;
    }
  }

  /**
   * Get confidence analysis for agent reports
   */
  async getConfidenceAnalysis() {
    try {
      const confidenceStats = await Report.aggregate([
        { $match: { 'metadata.processingMethod': 'agentic' } },
        {
          $group: {
            _id: null,
            avgConfidence: { $avg: '$metadata.confidence' },
            maxConfidence: { $max: '$metadata.confidence' },
            minConfidence: { $min: '$metadata.confidence' },
            totalReports: { $sum: 1 }
          }
        }
      ]);

      const confidenceDistribution = await Report.aggregate([
        { $match: { 'metadata.processingMethod': 'agentic' } },
        {
          $bucket: {
            groupBy: '$metadata.confidence',
            boundaries: [0, 0.3, 0.5, 0.7, 0.9, 1.0],
            default: 'other',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]);

      return {
        overall: confidenceStats[0] || null,
        distribution: confidenceDistribution
      };
    } catch (error) {
      console.error('Error getting confidence analysis:', error);
      throw error;
    }
  }

  /**
   * Get user adoption metrics
   */
  async getUserAdoptionMetrics() {
    try {
      const totalUsers = await User.countDocuments();
      
      const agentUsers = await User.aggregate([
        {
          $lookup: {
            from: 'reports',
            localField: '_id',
            foreignField: 'reporterId',
            as: 'reports'
          }
        },
        {
          $match: {
            'reports.metadata.processingMethod': 'agentic'
          }
        },
        {
          $count: 'agentUsers'
        }
      ]);

      const agentUserCount = agentUsers[0]?.agentUsers || 0;
      const adoptionRate = totalUsers > 0 ? (agentUserCount / totalUsers) * 100 : 0;

      // Power users (10+ agent reports)
      const powerUsers = await User.aggregate([
        {
          $lookup: {
            from: 'reports',
            localField: '_id',
            foreignField: 'reporterId',
            as: 'agentReports'
          }
        },
        {
          $match: {
            'agentReports.metadata.processingMethod': 'agentic'
          }
        },
        {
          $addFields: {
            agentReportCount: { $size: '$agentReports' }
          }
        },
        {
          $match: {
            agentReportCount: { $gte: 10 }
          }
        },
        {
          $count: 'powerUsers'
        }
      ]);

      return {
        totalUsers,
        agentUsers: agentUserCount,
        adoptionRate: Math.round(adoptionRate * 100) / 100,
        powerUsers: powerUsers[0]?.powerUsers || 0
      };
    } catch (error) {
      console.error('Error getting user adoption metrics:', error);
      throw error;
    }
  }

  /**
   * Get processing method effectiveness
   */
  async getProcessingEffectiveness() {
    try {
      const agentReports = await Report.find({
        'metadata.processingMethod': 'agentic'
      }).select('status urgency priority upvoteCount createdAt');

      const manualReports = await Report.find({
        'metadata.processingMethod': { $ne: 'agentic' }
      }).select('status urgency priority upvoteCount createdAt');

      const agentStats = this.calculateReportStats(agentReports);
      const manualStats = this.calculateReportStats(manualReports);

      return {
        agent: agentStats,
        manual: manualStats,
        comparison: {
          resolutionRate: {
            agent: agentStats.resolutionRate,
            manual: manualStats.resolutionRate,
            difference: agentStats.resolutionRate - manualStats.resolutionRate
          },
          averageUpvotes: {
            agent: agentStats.averageUpvotes,
            manual: manualStats.averageUpvotes,
            difference: agentStats.averageUpvotes - manualStats.averageUpvotes
          },
          averageResolutionTime: {
            agent: agentStats.averageResolutionTime,
            manual: manualStats.averageResolutionTime,
            difference: agentStats.averageResolutionTime - manualStats.averageResolutionTime
          }
        }
      };
    } catch (error) {
      console.error('Error getting processing effectiveness:', error);
      throw error;
    }
  }

  /**
   * Calculate statistics for a set of reports
   */
  calculateReportStats(reports) {
    const total = reports.length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
    
    const totalUpvotes = reports.reduce((sum, r) => sum + (r.upvoteCount || 0), 0);
    const averageUpvotes = total > 0 ? totalUpvotes / total : 0;

    // Calculate average resolution time
    const resolvedReports = reports.filter(r => r.status === 'resolved' && r.resolvedAt);
    const resolutionTimes = resolvedReports.map(r => 
      new Date(r.resolvedAt) - new Date(r.createdAt)
    );
    const averageResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
      : 0;

    return {
      total,
      resolved,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      averageUpvotes: Math.round(averageUpvotes * 100) / 100,
      averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60 * 24)) // in days
    };
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardData(timeframe = '30d') {
    try {
      const [
        overallStats,
        usageTrends,
        categoryAnalysis,
        confidenceAnalysis,
        userAdoption,
        processingEffectiveness
      ] = await Promise.all([
        this.getOverallStats(),
        this.getUsageTrends(timeframe),
        this.getCategoryAnalysis(),
        this.getConfidenceAnalysis(),
        this.getUserAdoptionMetrics(),
        this.getProcessingEffectiveness()
      ]);

      return {
        timeframe,
        generatedAt: new Date().toISOString(),
        overall: overallStats,
        trends: usageTrends,
        categories: categoryAnalysis,
        confidence: confidenceAnalysis,
        adoption: userAdoption,
        effectiveness: processingEffectiveness
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
}

export default new AgentAnalyticsService();
