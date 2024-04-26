import mongoose from "mongoose";

const historyDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      default: "",
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Activity",
    },
    description: String,
    details: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("HistoryDetail", historyDetailSchema);
