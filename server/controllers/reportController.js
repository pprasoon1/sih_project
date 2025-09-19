import Report from "../models/Report.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { createAndEmitNotification } from '../services/notificationService.js';

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

export const createReport = async (req, res) => {
  try {
    const { title, description, category, coordinates } = req.body;

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

    // 3. Create Report in Database
    const report = await Report.create({
      reporterId: req.user._id,
      title,
      description,
      category,
      location: { type: "Point", coordinates: parsedCoordinates },
      mediaUrls,
    });

    const reportToEmit = await Report.findById(report._id).populate("reporterId", "name email");

    // 4. Handle Real-time Events and Notifications
    // This event is for the live list/map update on the admin dashboard
    req.io.emit("newReport", reportToEmit);

    // This creates persistent notifications for the admin's notification bell
    const admins = await User.find({ role: 'admin' });
    const notificationTitle = "New Report Submitted";
    const notificationBody = `A report "${report.title}" was submitted by ${req.user.name}.`;

    admins.forEach(admin => {
      createAndEmitNotification(req.io, admin._id, notificationTitle, notificationBody, report._id);
    });

    // 👇 Add this block to award points for submission
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } }); // Award 5 points
    // toast.success("Report submitted! +5 points"); // This is a placeholder for frontend toast

     // Check for "First Report" badge
     const reportCount = await Report.countDocuments({ reporterId: req.user._id });
    if (reportCount === 1) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { badges: 'first_report' } });
    }

    res.status(201).json(reportToEmit);
  } catch (error) {
    console.error("❌ Unexpected Error in createReport:", error);
    res.status(500).json({ message: "An unexpected error occurred while creating the report." });
  }
};

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
    const { lng, lat, radius = 5000, category } = req.query; // Default radius of 5km
    
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
    res.status(500).json({ message: "Error fetching report feed." });
  }
};

// @desc    Upvote or remove upvote from a report
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

// @desc    Add a comment to a report
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

// @desc    Get all comments for a report
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