import Report from "../models/Report.js";
import Department from "../models/Department.js";
import Update from '../models/Update.js';
import User from "../models/User.js";
import { createAndEmitNotification } from '../services/notificationService.js';
import { sendEscalationEmail } from '../config/mailer.js';

// @desc    Get all reports (with filtering)
export const getAllReports = async (req, res) => {
  try {
    const { status, category, sortBy = 'createdAt' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const sortOrder = sortBy === 'upvoteCount' ? { upvoteCount: -1 } : { createdAt: -1 };

    const reports = await Report.find(filter)
      .populate("reporterId", "name email")
      .populate("assignedDept", "name")
      .sort(sortOrder);

    res.json(reports);
  } catch (error) {
    console.error("❌ Error in getAllReports:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a single report by ID with its history
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporterId', 'name email')
      .populate('assignedDept', 'name');
      
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const history = await Update.find({ report: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: 'asc' });
      
    res.json({ report, history });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a report's status
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const originalStatus = report.status;
    report.status = status;

    // Transition to resolved: set timestamp once on first resolve
    if (status === 'resolved' && originalStatus !== 'resolved' && !report.resolvedAt) {
      report.resolvedAt = new Date();
    }

    await report.save();

    // Award points when transitioning to resolved for the first time
    if (status === 'resolved' && originalStatus !== 'resolved') {
      try {
        await User.findByIdAndUpdate(report.reporterId, { $inc: { points: 25 } });
        const resolvedCount = await Report.countDocuments({ reporterId: report.reporterId, status: 'resolved' });
        if (resolvedCount === 1) {
          await User.findByIdAndUpdate(report.reporterId, { $addToSet: { badges: 'problem_solver_1' } });
        } else if (resolvedCount === 5) {
          await User.findByIdAndUpdate(report.reporterId, { $addToSet: { badges: 'problem_solver_5' } });
        }
      } catch (awardErr) {
        console.warn('Points/badges award failed:', awardErr?.message || awardErr);
      }
    }

    // Log update history
    await Update.create({
      report: report._id,
      user: req.user?._id || null,
      changeType: 'status_change',
      fromValue: originalStatus,
      toValue: report.status,
    });

    // Notify reporter (socket + persistent notification)
    const populatedReport = await Report.findById(report._id)
      .populate('reporterId')
      .populate('assignedDept');

    // Best-effort socket room emit if available
    try {
      if (req.io && populatedReport?.reporterId?._id) {
        req.io.to(populatedReport.reporterId._id.toString()).emit('reportStatusUpdated', {
          reportId: populatedReport._id,
          status: populatedReport.status,
        });
      }
    } catch (emitErr) {
      console.warn('Socket emit failed:', emitErr?.message || emitErr);
    }

    if (populatedReport?.reporterId) {
      const { _id, name } = populatedReport.reporterId;
      const title = `Status Updated: ${populatedReport.title}`;
      const body = `Hi ${name}, your report is now "${populatedReport.status}".`;
      await createAndEmitNotification(req.io, _id, title, body, populatedReport._id);
    }

    return res.json(populatedReport);
  } catch (error) {
    console.error("❌ Error in updateReportStatus:", error);
    return res.status(500).json({ message: "Server Error" });
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
      // Log this action
      await Update.create({
        report: report._id,
        user: req.user._id,
        changeType: 'assigned',
        toValue: populatedReport.assignedDept.name,
      });

      // Send notification
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

// @desc    Escalate a report via email
export const escalateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('reporterId', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });

    await sendEscalationEmail(report, report.reporterId);
    
    // Log this action
    await Update.create({
      report: report._id,
      user: req.user._id,
      changeType: 'escalated',
    });

    res.status(200).json({ message: 'Report escalated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error while escalating report' });
  }
};

// @desc    Create a new department
export const createDepartment = async (req, res) => {
  try {
    const { name, categories } = req.body;
    const department = await Department.create({ name, categories });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: "Error creating department" });
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

// @desc    Create a new staff member
// export const createStaff = async (req, res) => {
//     const { name, email, password, department } = req.body;
//     try {
//         const userExists = await User.findOne({ email });
//         if (userExists) return res.status(400).json({ message: 'User already exists' });

//         const user = await User.create({
//             name, email, password, department,
//             role: 'staff' // Set role to staff
//         });
//         res.status(201).json({ _id: user._id, name: user.name, email: user.email });
//     } catch (error) { res.status(500).json({ message: 'Server Error' }); }
// };

// @desc    Assign a report to a staff member
export const assignReportToStaff = async (req, res) => {
    const { staffId } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.assignedStaff = staffId;
    await report.save();
    // TODO: Create an 'Update' log and send a notification to the staff member
    res.json({ message: 'Report assigned to staff.' });
};

// @desc    Create a new staff member
// @route   POST /api/admin/staff
// @access  Private/Admin
export const createStaff = async (req, res) => {
    const { name, email, password, department } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            department,
            role: 'staff' // Explicitly set the role to 'staff'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("❌ Error creating staff:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private/Admin
export const getAllStaff = async (req, res) => {
    try {
        const staffMembers = await User.find({ role: 'staff' })
            .populate('department', 'name') // Populate the department's name
            .select('-password'); // Exclude password from the result
        res.json(staffMembers);
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};