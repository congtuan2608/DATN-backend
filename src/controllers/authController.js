import User from "../models/user.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function generateToken(id) {
  const payload = {
    id,
  };

  const options = {
    expiresIn: "2d",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}
export function generateRefreshToken(id) {
  const payload = {
    id,
  };

  const options = {
    expiresIn: "30d",
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, options);
}

export function hashingPassword(password) {
  return bcrypt.hashSync(
    password,
    bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS))
  );
}
export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export const signUpHandler = async (req, res) => {
  try {
    const data = req.body;
    const existingUser = await User.findOne({
      email: data.email,
    });
    if (existingUser) return errorHandler(res, "User already exists", 400);
    if (!existingUser) {
      const hashedPassword = hashingPassword(data.password);
      data.password = hashedPassword;
      const doc = await User.create(data);
      const { password, ...other } = doc._doc;
      return res.status(201).json(other);
    }
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const loginHandler = async (req, res) => {
  try {
    const data = req.body;
    const existingUser = await User.findOne({
      email: data.email,
    });
    if (!existingUser) return errorHandler(res, "User not found", 404);

    const isPasswordValid = comparePassword(
      data.password,
      existingUser.password
    );
    if (!isPasswordValid)
      return errorHandler(res, "Wrong username or password", 404);

    const token = generateToken(existingUser._id);
    const refreshToken = generateRefreshToken(existingUser._id);
    const { password, ...other } = existingUser._doc;
    return res.status(200).json({ user: other, token, refreshToken });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const getUserHandler = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return errorHandler(res, "User not found", 404);
    }
    const { password, ...other } = user._doc;
    res.status(200).json({ ...other });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
