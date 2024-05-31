import express from "express";
import * as payments from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.route("/zalopay").post(verifyToken, payments.createZaloPayHandler);

router.route("/momo").post(verifyToken, payments.createMoMoPayHandler);

router.route("/momo/callback").post(payments.momoCallbackHandler);

router
  .route("/momo/transaction-status")
  .post(verifyToken, payments.momoTransactionStatusHandler);

export default router;
