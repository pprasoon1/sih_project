import Report from "../models/Report.js";
import Department from "../models/Department.js";
import { createAndEmitNotification } from '../services/notificationService.js';
import { sendEscalationEmail } from '../config/mailer.js'; 

// @desc    Get all reports (with filtering)
export const getAllReports = async (req, res) => {
  try {
    const { status, category, sortBy = 'createdAt' } = req.query; // 👈 Add sortBy
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Determine sort order. -1 means descending.
    const sortOrder = sortBy === 'upvoteCount' ? { upvoteCount: -1 } : { createdAt: -1 };

    const reports = await Report.find(filter)
      .populate("reporterId", "name email")
      .populate("assignedDept", "name")
      .sort(sortOrder);

    res.json(reports);
  }
     catch (error) {
    console.error("❌ Error in getAllReports:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// @desc    Update a report's status
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status || report.status;
    if (status === 'resolved' && !report.resolvedAt) {
      report.resolvedAt = new Date();
    }
    await report.save();
    
    const populatedReport = await Report.findById(report._id).populate('reporterId').populate('assignedDept');
    if (populatedReport.reporterId) {
      const { _id, name } = populatedReport.reporterId;
      const title = `Status Updated: ${populatedReport.title}`;
      const body = `Hi ${name}, your report is now "${populatedReport.status}".`;
      await createAndEmitNotification(req.io, _id, title, body, populatedReport._id);
    }
    res.json(populatedReport);
  } catch (error) {
    console.error("❌ Error in updateReportStatus:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporterId', 'name email')
      .populate('assignedDept', 'name');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Escalate a report via email
// @route   POST /api/admin/reports/:id/escalate
export const escalateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('reporterId', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });

    await sendEscalationEmail(report, report.reporterId);
    res.status(200).json({ message: 'Report escalated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error while escalating report' });
  }
};

// @desc    Assign a report to a department

export const assignReportToDept = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.assignedDept = departmentId;
    if (report.status === 'new') report.status = 'acknowledged';
    await report.save();
    
    const populatedReport = await Report.findById(report._id).populate('reporterId').populate('assignedDept');
    if (populatedReport.reporterId && populatedReport.assignedDept) {
      const { _id, name } = populatedReport.reporterId;
      const deptName = populatedReport.assignedDept.name;
      const title = `Report Assigned: ${populatedReport.title}`;
      const body = `Hi ${name}, your report was assigned to the ${deptName} department.`;
      await createAndEmitNotification(req.io, _id, title, body, populatedReport._id);
    }
    res.json(populatedReport);
  } catch (error) {
    console.error("❌ Error in assignReportToDept:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// @desc    Create a new department
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
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};