import mongoose from "mongoose";

const contaminatedLocationSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: { latitude: Number, longitude: Number },
    address: { type: String, required: true },
    description: String,
    contaminatedType: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ContaminatedType" },
    ],
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
    },
    status: {
      type: String,
      enum: [
        "processed",
        "processing",
        "need-intervention",
        "no-need-intervention",
      ],
    },
    assets: [
      { type: mongoose.Schema.Types.Mixed },
      // {
      //   media_type: String, // mp3 mp4 || jpg png ...
      //   url: String,
      // },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ContaminatedLocation",
  contaminatedLocationSchema
);
