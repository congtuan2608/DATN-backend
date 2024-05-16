import express from "express";
import * as location from "../controllers/contaminatedLocationController.js";
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.route("/contaminated-type").get(location.getContaminatedTypeHandler);

router
  .route("/contaminated-type")
  .post(verifyToken, location.createContaminatedTypeHandler);

router.route("/contaminated-location").get(location.getReportLocationHandler);

router
  .route("/contaminated-location-nearby")
  .get(location.getReportLocationNearbyHandler);

router
  .route("/contaminated-location")
  .post(
    verifyToken,
    upload.array("assets", 10),
    location.createReportLocationHandler
  );

export default router;
