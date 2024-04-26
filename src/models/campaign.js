import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    startDate: { Date, required: true },
    endDate: { Date, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    limit: { type: Number, default: 30 }, // giới hạn số người tham gia
    fund: { type: Number, default: 0 }, // tiền quỹ
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContaminatedLocation",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Campaign", campaignSchema);
