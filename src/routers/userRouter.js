import express from "express";
import * as user from "../controllers/userController.js";
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.route("/").delete(verifyToken, user.deleteUserHandler);

router
  .route("/")
  .patch(verifyToken, upload.single("avatar"), user.updateUserHandler);

router.route("/").get(verifyToken, user.getUserHandler);

export default router;
