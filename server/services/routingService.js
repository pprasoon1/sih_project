import Department from "../models/Department.js";
import Update from "../models/Update.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

// Haversine distance in meters between [lng, lat]
const distanceMeters = (a, b) => {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

/**
 * Routing Service
 * - Assigns a newly created report to the appropriate department based on category
 * - Prefers departments whose serviceAreas contain the report location
 * - If none contain, picks the closest serviceArea
 * - Sets status to 'acknowledged' when auto-routed
 * - Logs Update entries
 * - Attempts load-balanced staff assignment within the department
 */
export const routeReport = async (report, userPerformingActionId) => {
  try {
    if (!report || !report.category) return report;

    const candidateDepts = await Department.find({ categories: report.category });
    if (!candidateDepts || candidateDepts.length === 0) return report;

    let chosen = candidateDepts[0];
    const hasLocation = Array.isArray(report.location?.coordinates) && report.location.coordinates.length === 2;

    if (hasLocation) {
      const pt = report.location.coordinates; // [lng, lat]
      // First, departments whose any service area contains the point
      const containing = candidateDepts.filter((d) =>
        (d.serviceAreas || []).some(sa => sa?.center?.length === 2 && sa.radiusMeters > 0 && distanceMeters(sa.center, pt) <= sa.radiusMeters)
      );
      if (containing.length > 0) {
        chosen = containing[0];
      } else {
        // Otherwise pick the department with nearest center
        let best = { dept: candidateDepts[0], dist: Number.POSITIVE_INFINITY };
        for (const d of candidateDepts) {
          for (const sa of (d.serviceAreas || [])) {
            if (sa?.center?.length === 2) {
              const dist = distanceMeters(sa.center, pt);
              if (dist < best.dist) best = { dept: d, dist };
            }
          }
        }
        if (best.dept) chosen = best.dept;
      }
    }

    // Assign and acknowledge if not already acknowledged/in_progress/resolved
    report.assignedDept = chosen._id;
    if (report.status === 'new') {
      report.status = 'acknowledged';
    }
    await report.save();

    // Log dept assignment
    await Update.create({
      report: report._id,
      user: userPerformingActionId || null,
      changeType: 'assigned',
      toValue: chosen.name,
    });

    // Load-balanced staff assignment
    const staff = await User.find({ role: 'staff', department: chosen._id }).select('_id name');
    if (staff && staff.length > 0) {
      let bestStaff = null;
      let bestLoad = Number.POSITIVE_INFINITY;
      for (const s of staff) {
        const load = await Report.countDocuments({ assignedStaff: s._id, status: { $ne: 'resolved' } });
        if (load < bestLoad) { bestLoad = load; bestStaff = s; }
      }
      if (bestStaff) {
        report.assignedStaff = bestStaff._id;
        await report.save();
        await Update.create({
          report: report._id,
          user: userPerformingActionId || null,
          changeType: 'assigned_staff',
          toValue: bestStaff.name || bestStaff._id.toString(),
        });
      }
    }

    return report;
  } catch (err) {
    console.error('Auto-routing failed:', err);
    return report; // fail-safe: return original report without routing
  }
};

export default { routeReport };
