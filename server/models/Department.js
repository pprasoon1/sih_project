import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    categories: [String],
    staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Optional service areas to prefer routing by location
    // Simple circles: center [lng, lat], radius in meters
    serviceAreas: [
      {
        center: { type: [Number], index: false }, // [lng, lat]
        radiusMeters: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
