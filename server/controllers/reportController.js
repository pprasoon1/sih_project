// controllers/reportController.js

import Report from "../models/Report.js";

export const createReport = async (req, res) => {
  try {
    console.log("📩 Incoming Report:", req.body);
    console.log("📸 Uploaded Files:", req.files);

    const { title, description, category, coordinates } = req.body;

    let parsedCoordinates;
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (err) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    const mediaUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newReport = await Report.create({ // Renamed to newReport for clarity
      reporterId: req.user._id,
      title,
      description,
      category,
      location: { type: "Point", coordinates: parsedCoordinates },
      mediaUrls,
    });
    
    // Populate reporter info before emitting, so frontend receives it
    const reportToEmit = await Report.findById(newReport._id).populate("reporterId", "name email");

    // Corrected the event name to match the frontend listener
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