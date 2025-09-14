import Report from "../models/Report.js";

export const createReport = async (req, res) => {
  const { title, description, category, coordinates, mediaUrls } = req.body;
  const report = await Report.create({
    reporterId: req.user._id,
    title,
    description,
    category,
    location: { type: "Point", coordinates },
    mediaUrls,
  });
  req.io.emit("reports:new", report); // 🔔 Notify admins in real-time
  res.status(201).json(report);
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
