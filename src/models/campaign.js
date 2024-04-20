import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    fund: { type: Number, default: 0 }, // tiền quỹ
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContaminatedLocation",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Campaign", campaignSchema);
