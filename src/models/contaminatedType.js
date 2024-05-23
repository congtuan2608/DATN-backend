import mongoose from "mongoose";

const contaminatedTypeSchema = new mongoose.Schema(
  {
    contaminatedType: {
      type: String,
      unique: true,
      required: true,
    },
    contaminatedName: {
      type: String,
      required: true,
    },
    asset: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("ContaminatedType", contaminatedTypeSchema);
