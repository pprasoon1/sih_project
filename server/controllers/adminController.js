import Report from "../models/Report.js";
import Department from "../models/Department.js";
import { createAndEmitNotification } from '../services/notificationService.js';

// @desc    Get all reports (with filtering)
export const getAllReports = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const reports = await Report.find(filter)
      .populate("reporterId", "name email")
      .populate("assignedDept", "name")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error("❌ Error in getAllReports:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a report's status
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status || report.status;
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

// @desc    Assign a report to a department
export const assignReportToDept = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.assignedDept = departmentId;
    if (report.status === 'new') {
        report.status = 'acknowledged';
    }
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
    res.status(500).json({ message: "Server Error", error: error.message });
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