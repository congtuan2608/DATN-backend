import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import otp from "../models/otp.js";
import { default as User, default as user } from "../models/user.js";
import { sendEmailHandler } from "../services/sendEmail.js";
import { errorHandler, serverErrorHandler } from "../utils/errorHandler.js";

export function generateToken(id) {
  const payload = {
    id,
  };

  const options = {
    expiresIn: "2d",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}
export function generateRefreshToken(id, exp = "30d") {
  const payload = {
    id,
  };

  const options = {
    expiresIn: exp,
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
    if (existingUser)
      return errorHandler(res, "This email already exists", 400);

    if (req.file) {
      data.avatar = await uploadFileAndReturn(req.file, "avatar");
    }

    const hashedPassword = hashingPassword(data.password);
    data.password = hashedPassword;
    const doc = await User.create(data);
    const { password, ...other } = doc._doc;
    return res.status(201).json(other);
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

    const accessToken = generateToken(existingUser._id);
    const refreshToken = generateRefreshToken(existingUser._id);
    const { password, ...other } = existingUser._doc;
    return res.status(200).json({ user: other, accessToken, refreshToken });
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
    return res.status(200).json({ ...other });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    const response = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email_verified, name, given_name, family_name, email, picture } =
      response.payload;

    if (!email_verified)
      return res.status(400).json("Google login failed. Try again.");

    const user = await User.findOne({ email });
    if (user) {
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      const { password, ...other } = user._doc;

      return res.status(200).json({ user: other, accessToken, refreshToken });
    } else {
      const hashedPassword = hashingPassword(email + process.env.JWT_SECRET);
      const doc = await User.create({
        firstName: given_name,
        ...(family_name && { lastName: family_name }),
        email,
        avatar: {
          url: picture,
          media_type: "image",
        },
        password: hashedPassword,
      });

      const accessToken = generateToken(doc._id);
      const refreshToken = generateRefreshToken(doc._id);
      const { password, ...other } = doc;

      return res.status(201).json({ user: other, accessToken, refreshToken });
    }
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const sendOTPHandler = async (req, res) => {
  try {
    const { email, type } = req.body;
    //type: email or phone number
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return errorHandler(res, "User not found", 404);
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await otp.create({ email, otp: hashingPassword(code) });
    // send email with otp
    const statusSendEmail = await sendEmailHandler({
      to: [email],
      subject: "OTP Code for Reset Password",
      values: { code, type: "otp", fullName: existingUser.fullName },
      headers: {
        "X-MT-Category": "Send OTP",
      },
    });
    console.log("Code: ", code);
    if (!statusSendEmail.isSuccess)
      return errorHandler(res, "Unable to send OTP to this email!", 400);

    return res
      .status(201)
      .json({ isSuccess: true, message: "Check your email to reset password" });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const verifyOTPHandler = async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!code) return errorHandler(res, "Code is required", 400);

    const existingEmail = await otp.find({ email });

    if (!existingEmail.length)
      return errorHandler(res, "This code has expired!", 400);

    const isPasswordValid = comparePassword(
      code,
      existingEmail[existingEmail.length - 1].otp
    );
    if (!isPasswordValid) return errorHandler(res, "Invalid code", 400);

    await otp.deleteMany({ email });

    return res
      .status(200)
      .json({ isSuccess: true, message: "OTP code is valid" });
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export const resetPasswordHandler = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email) return errorHandler(res, "Email is required", 400);

    if (!newPassword) return errorHandler(res, "New password is required", 400);

    const result = await user.findOneAndUpdate(
      { email },
      { password: hashingPassword(newPassword) }
    );
    if (!result) return errorHandler(res, "User not found", 404);
    const { password, ...other } = result._doc;

    return res.status(200).json(other);
  } catch (error) {
    serverErrorHandler(error, res);
  }
};
