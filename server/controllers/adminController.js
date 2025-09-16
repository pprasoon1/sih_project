// controllers/adminController.js

import Report from "../models/Report.js";
import Department from "../models/Department.js";

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
      .populate("assignedDept", "name")
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

// @desc    Create a new department
// @route   POST /api/admin/departments
export const createDepartment = async (req, res) => {
  const { name, categories } = req.body;
  try {
    const department = await Department.create({ name, categories });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: "Error creating department", error: error.message });
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- Assignment Controller ---

// @desc    Assign a report to a department
// @route   PUT /api/admin/reports/:id/assign
export const assignReportToDept = async (req, res) => {
  const { departmentId } = req.body;
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.assignedDept = departmentId;
    // Optionally, change status to 'acknowledged' or 'in_progress' upon assignment
    if (report.status === 'new') {
        report.status = 'acknowledged';
    }
    
    const updatedReport = await report.save();

     // TODO: Emit a socket event to notify relevant parties
    // req.io.emit(`report:${report._id}:update`, updatedReport);
    // TODO: Trigger a push notification to the citizen
    
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};