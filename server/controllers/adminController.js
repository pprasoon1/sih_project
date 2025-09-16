// controllers/adminController.js

import Report from "../models/Report.js";

// @desc    Get all reports (with filtering)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAllReports = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const reports = await Report.find(filter)
      .populate("reporterId", "name email") // get reporter's name and email
      .sort({ createdAt: -1 }); // newest first

    res.json(reports);
  } catch (error) {
    console.error("❌ Error in getAllReports:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status || report.status;
    const updatedReport = await report.save();

    // TODO: Emit a socket event to notify the citizen in real-time
    // req.io.emit(`report:${report._id}:update`, updatedReport);
    
    res.json(updatedReport);
  } catch (error) {
    console.error("❌ Error in updateReportStatus:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};