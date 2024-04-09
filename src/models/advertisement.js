import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    descriptsion: String,
    adsType: {
      type: String,
      enum: ["image", "video", "text"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    adsDuration: {
      type: Number,
    },
    adsCost: {
      type: Number,
      default: 0,
    },
    adsSponsor: String,
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Advertisement", advertisementSchema);
