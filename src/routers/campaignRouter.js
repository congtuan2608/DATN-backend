import express from "express";
import * as campaignController from "../controllers/campaignController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router
  .route("/joined-campaign/:id")
  .get(verifyToken, campaignController.joinedCampaignHandler);
router
  .route("/leaved-campaign/:id")
  .get(verifyToken, campaignController.leavedCampaignHandler);

router.route("/").post(verifyToken, campaignController.createCampainHandler);

export default router;
