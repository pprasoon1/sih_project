import mongoose from "mongoose";

const updateSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who made the change
  changeType: {
    type: String,
    enum: ['created', 'status_change', 'assigned', 'comment', 'escalated'],
    required: true,
  },
  fromValue: { type: String }, // e.g., 'new'
  toValue: { type: String },   // e.g., 'acknowledged'
  comment: { type: String },  // For comments
}, { timestamps: true });

export default mongoose.model('Update', updateSchema);