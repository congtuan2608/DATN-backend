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
    },
    fullName: String,
    avatar: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        url: "https://res.cloudinary.com/dudwjr0ux/image/upload/v1713516262/public/user-avatar-2_t8b3xi.jpg",
        media_type: "image",
        folder: "public",
      },
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
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
    role: {
      type: String,
      enum: ["user", "organization", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
  console.log("he;l;lsdfkjh");
  this.fullName = [this.firstName, this.lastName].filter(Boolean).join(" ");
  next();
});
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  // Get the original document
  if (!(update?.firstName || update?.lastName)) return next();
  const originalDoc = await this.model.findOne(this._conditions);

  if (update?.firstName || update?.lastName) {
    update.fullName = [
      update?.firstName || originalDoc.firstName,
      update?.lastName || originalDoc.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    this.setUpdate(update);
  }
  next();
});
export default mongoose.model("User", userSchema);
