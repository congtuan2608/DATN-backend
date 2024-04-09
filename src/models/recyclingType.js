import mongoose from "mongoose";

const recyclingTypeSchema = new mongoose.Schema(
  {
    typeName: {
      type: String,
      required: true,
      unique: true,
    },
    recyclingName: {
      type: String,
      required: true,
    },
    recyclingGuides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecyclingGuide",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true }, toObject: { virtuals: true }
  }
);
export default mongoose.model("RecyclingType", recyclingTypeSchema);
