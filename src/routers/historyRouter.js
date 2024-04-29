import express from "express";
import * as historyController from "../controllers/historyController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.route("/activity-type").get(historyController.getActivityTypeHandler);
router
  .route("/activity-type")
  .post(historyController.createActivityTypeHandler);
router
  .route("/activity-type/:id")
  .patch(historyController.updateActivityTypeHandler);
router
  .route("/activity-type/:id")
  .delete(historyController.deleteActivityTypeHandler);

router
  .route("/details/:id")
  .get(verifyToken, historyController.getHistoryDetailByIdHandler);

router.route("/").get(verifyToken, historyController.getHistoryHandler);

export default router;
