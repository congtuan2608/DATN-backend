import express from "express";
import { upload } from "../middlewares/upload.js";
import * as auth from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.route("/sign-up").post(upload.single("avatar"), auth.signUpHandler);

router.route("/login").post(auth.loginHandler);

router.get("/", verifyToken, auth.getUserHandler);

export default router;
