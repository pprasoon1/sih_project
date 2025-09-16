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

    // 1. Safely Parse Coordinates
    let parsedCoordinates;
    if (!coordinates) {
        return res.status(400).json({ message: "Coordinates are required." });
    }
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (err) {
      // If parsing fails, send a clear 400 Bad Request error
      return res.status(400).json({ message: "Invalid coordinates format. Expected a JSON string like '[lng, lat]'." });
    }

    // 2. Handle File Uploads to Cloudinary
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);
      mediaUrls = uploadResults.map(result => result.secure_url);
    }

    // 3. Create Report in Database with Cloudinary URLs
    const report = await Report.create({
      reporterId: req.user._id,
      title,
      description,
      category,
      location: { type: "Point", coordinates: parsedCoordinates },
      mediaUrls,
    });

    const reportToEmit = await Report.findById(report._id).populate("reporterId", "name email");
    req.io.emit("newReport", reportToEmit);

    res.status(201).json(reportToEmit);
  } catch (error) {
    // This will now only catch unexpected server errors (e.g., database connection issues)
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
          $maxDistance: 2000 // 2000 meters = 2km
        } 
      },
    });

    res.json(reports);
  } catch(error) {
    console.error("❌ Error in getReportsNearby:", error);
    res.status(500).json({ message: "Error fetching nearby reports." });
  }
};