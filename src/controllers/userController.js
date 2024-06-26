import user from "../models/user.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import { deleteFile, uploadFileAndReturn } from "../utils/handleFileCloud.js";
import { comparePassword, hashingPassword } from "./authController.js";

export const getUserHandler = async (req, res) => {
  try {
    const result = await user.findOne({ _id: req.user.id });
    if (!result) {
      return errorHandler(res, "User not found", 404);
    }
    const { password, ...other } = result._doc;
    return res.status(200).json({ ...other });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const updateUserHandler = async (req, res) => {
  try {
    const { oldPassword, newPassword, ...data } = req.body;
    const existingUser = await user.findById(req.user.id);

    if (!existingUser) {
      return errorHandler(res, "User not found", 404);
    }

    if (oldPassword && newPassword) {
      const isPasswordValid = comparePassword(
        oldPassword,
        existingUser.password
      );
      if (!isPasswordValid) return errorHandler(res, "Wrong old password", 400);

      data.password = hashingPassword(newPassword);
    }

    if ("avatar" in data) {
      data.avatar = {
        url: "https://res.cloudinary.com/dudwjr0ux/image/upload/v1713516262/public/user-avatar-2_t8b3xi.jpg",
        media_type: "image",
        folder: "images",
      };
      if (existingUser.avatar?.public_id)
        deleteFile(existingUser.avatar.public_id);
    }
    if (req.file) {
      data.avatar = await uploadFileAndReturn(req.file, "avatar");
      if (existingUser.avatar?.public_id)
        deleteFile(existingUser.avatar.public_id);
    }
    await user.findByIdAndUpdate(req.user?.id, data);

    return res.status(200).json("Update successfully");
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
export const deleteUserHandler = async (req, res) => {
  try {
    const result = await user.findOne({ _id: req.user.id });
    if (!result) {
      return errorHandler(res, "User not found", 404);
    }
    const { password, ...other } = result._doc;
    return res.status(200).json({ ...other });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
