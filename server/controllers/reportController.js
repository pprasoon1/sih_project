// controllers/reportController.js

import Report from "../models/Report.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" }, // Automatically detect file type (image, video)
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
    
    // 1. Handle File Uploads to Cloudinary
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload all files in parallel
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);
      mediaUrls = uploadResults.map(result => result.secure_url);
    }

    // 2. Parse Coordinates
    const parsedCoordinates = JSON.parse(coordinates);

    // 3. Create Report in Database with Cloudinary URLs
    const report = await Report.create({
      reporterId: req.user._id,
      title,
      description,
      category,
      location: { type: "Point", coordinates: parsedCoordinates },
      mediaUrls, // 👈 Use the secure URLs from Cloudinary
    });

    const reportToEmit = await Report.findById(report._id).populate("reporterId", "name email");
    req.io.emit("newReport", reportToEmit);

    res.status(201).json(reportToEmit);
  } catch (error) {
    console.error("❌ Error in createReport:", error.message);
    res.status(500).json({ message: "Error creating report" });
  }
};

// --- No changes needed for the functions below ---
export const getMyReports = async (req, res) => {
  const reports = await Report.find({ reporterId: req.user._id });
  res.json(reports);
};

export const getReportsNearby = async (req, res) => {
  const { lng, lat, category } = req.query;
  const filter = category ? { category } : {};
  const reports = await Report.find({
    ...filter,
    location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 2000 } },
  });
  res.json(reports);
};