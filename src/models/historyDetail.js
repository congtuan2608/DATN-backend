import momgoose from "mongoose";

const historyDetailSchema = new momgoose.Schema(
  {
    userId: {
      type: momgoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      default: "",
    },
    activityType: {
      type: momgoose.Schema.Types.ObjectId,
      required: true,
    },
    description: String,
    details: { type: momgoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);
export default momgoose.model("HistoryDetail", historyDetailSchema);
