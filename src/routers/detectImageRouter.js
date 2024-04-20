import express from "express";
import {
  detectImage,
  imageRecognition,
} from "../controllers/detectImageController.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();

//get data air-quality
router.route("/google-vision").post(upload.array("images"), detectImage);
router.route("/").post(upload.array("images"), imageRecognition);

export default router;
