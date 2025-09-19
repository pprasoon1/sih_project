import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["citizen", "staff", "admin"], default: "citizen" },
    department: { // New field
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
     points: { // 👈 Add this field
    type: Number,
    default: 0,
    index: true // Index for efficient sorting on the leaderboard
  },
   badges: [{ // 👈 Add this array to store badge IDs
    type: String,
  }],
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);
