import mongoose from "mongoose";
import RecyclingType from "./recyclingType.js";
import { serverErrorHandler } from "../utils/errorHandler.js";

const recyclingGuide = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
    },
    descriptsion: String,
    assets: [
      {
        media_type: String,
        url: String,
      },
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
