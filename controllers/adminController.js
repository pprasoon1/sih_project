import Report from "../models/Report.js";

export const getAllReports = async (req, res) => {
  const { status, category } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  const reports = await Report.find(filter).populate("reporterId", "name email");
  res.json(reports);
};

export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignedDept } = req.body;
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  report.status = status || report.status;
  if (assignedDept) report.assignedDept = assignedDept;
  await report.save();

  req.io.emit("reports:update", report); // 🔔 Notify citizens
  res.json(report);
};
