import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["pothole", "streetlight", "garbage", "water", "tree", "other"],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    mediaUrls: [String],
    status: {
      type: String,
      enum: ["new", "acknowledged", "in_progress", "resolved", "rejected"],
      default: "new",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    assignedDept: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    resolvedAt: { type: Date }, // 👈 Added field
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);