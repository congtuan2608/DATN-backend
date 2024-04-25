import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: true,
      unique: true,
    },
    activityName: String,
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Activity", activitySchema);
