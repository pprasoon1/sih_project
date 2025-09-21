import Report from "../models/Report.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { createAndEmitNotification } from '../services/notificationService.js';
import agentService from '../services/agentService.js';

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Enhanced createReport function that handles both traditional and agent submissions
 */
export const createReport = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      coordinates,
      processingMethod = 'manual',
      analysisResult,
      voiceTranscript,
      confidence,
      severity,
      suggestedPriority
    } = req.body;

    // 1. Safely Parse Coordinates
    let parsedCoordinates;
    if (!coordinates) {
        return res.status(400).json({ message: "Coordinates are required." });
    }
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (err) {
      return res.status(400).json({ message: "Invalid coordinates format. Expected a JSON string like '[lng, lat]'." });
    }

    // 2. Handle File Uploads to Cloudinary
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);
      mediaUrls = uploadResults.map(result => result.secure_url);
    }

    // 3. Determine urgency and priority based on processing method
    let finalUrgency = 'medium';
    let finalPriority = 'medium';
    
    if (processingMethod === 'agentic') {
      finalUrgency = severity || 'medium';
      finalPriority = suggestedPriority || 'medium';
    }

    // 4. Create Report in Database with enhanced metadata
    const reportData = {
      reporterId: req.user._id,
      title,
      description,
      category,
      location: { type: "Point", coordinates: parsedCoordinates },
      mediaUrls,
      urgency: finalUrgency,
      priority: finalPriority,
      metadata: {
        confidence: confidence || 0.5,
        processingMethod,
        voiceTranscript,
        analysisResult,
        editHistory: [{
          field: 'initial_creation',
          oldValue: null,
          newValue: processingMethod,
          editedAt: new Date()
        }]
      }
    };

    const report = await Report.create(reportData);
    const reportToEmit = await Report.findById(report._id).populate("reporterId", "name email");

    // 5. Handle Real-time Events and Notifications
    req.io.emit("newReport", reportToEmit);

    // Enhanced notification based on processing method
    const admins = await User.find({ role: 'admin' });
    const notificationTitle = processingMethod === 'agentic' 
      ? "New AI-Assisted Report Submitted" 
      : "New Report Submitted";
    const notificationBody = `A ${processingMethod} report "${report.title}" was submitted by ${req.user.name}.`;

    admins.forEach(admin => {
      createAndEmitNotification(req.io, admin._id, notificationTitle, notificationBody, report._id);
    });

    // 6. Award points based on processing method
    const pointsToAward = processingMethod === 'agentic' ? 8 : 5;
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: pointsToAward } });

    // 7. Check for badges
    const reportCount = await Report.countDocuments({ reporterId: req.user._id });
    if (reportCount === 1) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { badges: 'first_report' } });
    }

    // Check for agent-specific badges
    if (processingMethod === 'agentic') {
      const agentReportCount = await Report.countDocuments({ 
        reporterId: req.user._id,
        'metadata.processingMethod': 'agentic'
      });
      
      if (agentReportCount === 1) {
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { badges: 'ai_early_adopter' } });
      } else if (agentReportCount === 10) {
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { badges: 'ai_power_user' } });
      }
    }

    res.status(201).json({
      ...reportToEmit.toObject(),
      pointsAwarded: pointsToAward,
      processingMethod
    });

  } catch (error) {
    console.error("❌ Unexpected Error in createReport:", error);
    res.status(500).json({ message: "An unexpected error occurred while creating the report." });
  }
};

/**
 * Get reports with agent analytics
 */
export const getReportsWithAnalytics = async (req, res) => {
  try {
    const { includeAgentStats = false } = req.query;
    
    const reports = await Report.find({ reporterId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name email');

    if (includeAgentStats === 'true') {
      const agentStats = await getAgentReportStats(req.user._id);
      return res.json({
        reports,
        agentStats
      });
    }

    res.json(reports);
  } catch(error) {
    console.error("❌ Error in getReportsWithAnalytics:", error);
    res.status(500).json({ message: "Error fetching reports." });
  }
};

/**
 * Get agent-specific report statistics
 */
const getAgentReportStats = async (userId) => {
  try {
    const totalReports = await Report.countDocuments({ reporterId: userId });
    const agentReports = await Report.countDocuments({ 
      reporterId: userId,
      'metadata.processingMethod': 'agentic'
    });
    const manualReports = totalReports - agentReports;

    const categoryBreakdown = await Report.aggregate([
      { $match: { reporterId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const confidenceStats = await Report.aggregate([
      { 
        $match: { 
          reporterId: userId,
          'metadata.confidence': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$metadata.confidence' },
          maxConfidence: { $max: '$metadata.confidence' },
          minConfidence: { $min: '$metadata.confidence' }
        }
      }
    ]);

    return {
      totalReports,
      agentReports,
      manualReports,
      agentUsagePercentage: totalReports > 0 ? (agentReports / totalReports) * 100 : 0,
      categoryBreakdown,
      confidenceStats: confidenceStats[0] || null
    };
  } catch (error) {
    console.error('Error getting agent stats:', error);
    return null;
  }
};

/**
 * Get all existing functions from original controller
 */
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch(error) {
    console.error("❌ Error in getMyReports:", error);
    res.status(500).json({ message: "Error fetching reports." });
  }
};

export const getReportsNearby = async (req, res) => {
  try {
    const { lng, lat, category } = req.query;
    const filter = category ? { category } : {};
    
    if(!lng || !lat) {
        return res.status(400).json({ message: "Longitude and latitude are required." });
    }

    const reports = await Report.find({
      ...filter,
      location: { 
        $near: { 
          $geometry: { 
            type: "Point", 
            coordinates: [parseFloat(lng), parseFloat(lat)] 
          }, 
          $maxDistance: 2000 // 2km
        } 
      },
    });

    res.json(reports);
  } catch(error) {
    console.error("❌ Error in getReportsNearby:", error);
    res.status(500).json({ message: "Error fetching nearby reports." });
  }
};

export const getReportsForFeed = async (req, res) => {
  try {
    const { lng, lat, radius = 20000, category } = req.query; // Default radius of 5km
    
    const filter = {};
    if (category) filter.category = category;

    const reports = await Report.find({
      ...filter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: parseInt(radius),
        },
      },
    })
    .populate('reporterId', 'name')
    .sort({ upvoteCount: -1, createdAt: -1 }) // Prioritize by upvotes, then recency
    .limit(50);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: `Error fetching report feed.${error.message}` });
  }
};

export const toggleUpvote = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        const userId = req.user._id.toString();

        const hasUpvoted = report.upvotedBy.includes(userId);

        if (hasUpvoted) {
            // Remove upvote
            report.upvotedBy.pull(userId);
        } else {
            // Add upvote
            report.upvotedBy.push(userId);
        }
        report.upvoteCount = report.upvotedBy.length;
        await report.save();

         // Check for "Community Voice" badge for the ORIGINAL reporter
    if (report.upvoteCount === 10) {
        await User.findByIdAndUpdate(report.reporterId, { $addToSet: { badges: 'community_voice_10' } });
    }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Error toggling upvote." });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const comment = await Comment.create({
            report: req.params.id,
            author: req.user._id,
            text,
        });
        const populatedComment = await Comment.findById(comment._id).populate('author', 'name');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: "Error adding comment." });
    }
};

export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ report: req.params.id })
            .populate('author', 'name')
            .sort({ createdAt: 'asc' });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments." });
    }
};
