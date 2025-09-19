import Report from '../models/Report.js';
import User from '../models/User.js';

// @desc    Staff resolves a report with a photo
export const resolveReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        // Assuming file URLs are sent in the body after uploading to Cloudinary
        const { resolvedMediaUrls } = req.body;

        report.status = 'resolved';
        report.resolvedAt = new Date();
        report.resolvedBy = req.user._id; // Logged-in staff member
        report.resolvedMediaUrls = resolvedMediaUrls;
        await report.save();

        // Award points and badges
        await User.findByIdAndUpdate(report.reporterId, { $inc: { points: 25 } });
        // TODO: Add badge logic

        // TODO: Send notification to the citizen with the "after" photo
        res.status(200).json({ message: 'Report resolved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};