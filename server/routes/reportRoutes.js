import express from "express";
import multer from "multer";
import {
    getMyReports,
    getReportsNearby,
    getReportsForFeed,
    getTrendingReports,
    toggleUpvote,
    addComment,
    getComments,
} from "../controllers/reportController.js";
import { createReport as createReportEnhanced } from "../controllers/enhancedReportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// // --- Multer Config for File Uploads ---
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // folder where files will be stored
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname); // unique filename
//   },
// });
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Routes ---
router.post("/", protect, upload.array("media", 5), createReportEnhanced);
// 🔹 Accepts up to 5 files under key "media"

router.get("/my", protect, getMyReports);
router.get("/nearby", protect, getReportsNearby);

router.get("/feed", protect, getReportsForFeed);
router.get("/trending", protect, getTrendingReports);
router.post("/:id/upvote", protect, toggleUpvote);
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, getComments);

export default router;
