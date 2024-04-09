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
  },
  { timestamps: true }
);

export default mongoose.model("ContaminatedType", contaminatedTypeSchema);
