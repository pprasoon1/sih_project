import Report from "../models/Report.js";

export const createReport = async (req, res) => {
  try {
    console.log("📩 Incoming Report:", req.body);
    console.log("📸 Uploaded Files:", req.files);

    const { title, description, category, coordinates } = req.body;

    // Fix: coordinates from frontend should be JSON string like "[77.1, 28.6]"
    let parsedCoordinates;
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (err) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    const mediaUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const report = await Report.create({
      reporterId: req.user._id,
      title,
      description,
      category,
      location: { type: "Point", coordinates: parsedCoordinates },
      mediaUrls,
    });

    // req.io.emit("reports:new", report);
    res.status(201).json(report);
  } catch (error) {
    console.error("❌ Error in createReport:", error.message);
    res.status(500).json({ message: "Error creating report" });
  }
};




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
