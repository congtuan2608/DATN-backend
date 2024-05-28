import express from "express";
import * as campaignController from "../controllers/campaignController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router
  .route("/nearby")
  .get(verifyToken, campaignController.getCampaignNearbyHandler);

router
  .route("/join-campaign/:id")
  .get(verifyToken, campaignController.joinCampaignHandler);
router
  .route("/leave-campaign/:id")
  .get(verifyToken, campaignController.leaveCampaignHandler);

router
  .route("/create")
  .post(verifyToken, campaignController.createCampainHandler);

router
  .route("/by-id/:id")
  .get(verifyToken, campaignController.getCampainByIdHandler);

router.route("/").get(verifyToken, campaignController.getCampainHandler);

export default router;
