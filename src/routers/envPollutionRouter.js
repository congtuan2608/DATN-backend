import express from "express";
import {
  getAirQuality,
  getEnvironmentalPollution,
} from "../controllers/envPollutionController.js";
const router = express.Router();

//get data air-quality
router.route("/").get(getEnvironmentalPollution);

export default router;
