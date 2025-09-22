import Department from "../models/Department.js";
import Update from "../models/Update.js";

/**
 * Routing Service
 * - Assigns a newly created report to the appropriate department based on category
 * - Sets status to 'acknowledged' when auto-routed
 * - Logs an Update entry
 */
export const routeReport = async (report, userPerformingActionId) => {
  try {
    if (!report || !report.category) return report;

    // Find a department that handles this category
    const dept = await Department.findOne({ categories: report.category });
    if (!dept) return report; // No matching department configured

    // Assign and acknowledge if not already acknowledged/in_progress/resolved
    report.assignedDept = dept._id;
    if (report.status === 'new') {
      report.status = 'acknowledged';
    }
    await report.save();

    // Log the assignment
    await Update.create({
      report: report._id,
      user: userPerformingActionId || null,
      changeType: 'assigned',
      toValue: dept.name,
    });

    return report;
  } catch (err) {
    console.error('Auto-routing failed:', err);
    return report; // fail-safe: return original report without routing
  }
};

export default { routeReport };