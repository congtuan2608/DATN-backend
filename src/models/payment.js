import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    method: {
      type: String, // momo, zalopay, bank, cash, vnpay
      required: true,
    },
    details: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);
export default mongoose.model("Payment", paymentSchema);
