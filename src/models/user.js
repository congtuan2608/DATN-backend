import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fullName: String,
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dudwjr0ux/image/upload/v1712904716/assets/user-avatar-2_hhfccz.jpg",
    },
    dateOfBirth: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
  this.fullName = [this.firstName, this.lastName].filter(Boolean).join(" ");
  next();
});
export default mongoose.model("User", userSchema);
