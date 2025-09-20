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
    assignedStaff: { // 👈 Field for specific staff assignment
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    resolvedAt: { type: Date }, // 👈 Added field
    resolvedMediaUrls: [{ type: String }], // 👈 Field for "after" photos
    resolvedBy: { // 👈 Field for the staff member who resolved it
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upvotedBy: [{ // Array of users who upvoted
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: { // Denormalized count for performance
    type: Number,
    default: 0,
    index: true // Add index for faster sorting
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  metadata: {
    confidence: { type: Number, min: 0, max: 1 },
    processingMethod: { 
      type: String, 
      enum: ['manual', 'agentic'], 
      default: 'manual' 
    },
    voiceTranscript: { type: String },
    analysisResult: { type: String },
    editHistory: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      editedAt: { type: Date, default: Date.now }
    }]
  }
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);