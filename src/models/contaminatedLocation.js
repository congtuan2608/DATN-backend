import mongoose from "mongoose";

const contaminatedLocationSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // location: { latitude: Number, longitude: Number },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, required: true },
    description: String,
    contaminatedType: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ContaminatedType" },
    ],
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
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
    hadCampaign: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "success", "rejected", "failed"],
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

contaminatedLocationSchema.index({ location: "2dsphere" });
export default mongoose.model(
  "ContaminatedLocation",
  contaminatedLocationSchema
);
