import express from "express";
import {
  googleVisionDetectHandler,
  tensorflowDetectHandler,
} from "../controllers/detectImageController.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();

// google vision detect
router
  .route("/google-vision")
  .post(upload.array("images"), googleVisionDetectHandler);

// tensorflow detect
router
  .route("/tensorflow")
  .post(upload.array("images"), tensorflowDetectHandler);

export default router;
