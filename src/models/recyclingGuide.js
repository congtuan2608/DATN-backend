import mongoose from "mongoose";

const recyclingGuide = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
    },
    descriptsion: String,
    assets: [
      { type: mongoose.Schema.Types.Mixed },
      // {
      //   media_type: String,
      //   url: String,
      // },
    ],
    recyclingTips: String,
    recyclingTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecyclingType",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("RecyclingGuide", recyclingGuide);
