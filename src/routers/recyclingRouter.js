import express from "express";
import { upload } from "../middlewares/upload.js";
import * as recycling from "../controllers/recyclingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

// ======================== recycling guide =============================
// get all guide
router.route("/recycling-guide").get(recycling.getRecyclingGuideHandler);

// get by id guide
router
  .route("/recycling-guide/:id")
  .get(recycling.getByIdRecyclingGuideHandler);

// create guide
router
  .route("/recycling-guide")
  .post(
    verifyToken,
    upload.array("assets"),
    recycling.createRecyclingGuideHandler
  );

// update recycling-guide
router
  .route("/recycling-guide/:id")
  .patch(
    verifyToken,
    upload.array("assets"),
    recycling.updateRecyclingGuideHandler
  );

// get by id guide
router
  .route("/recycling-guide/:id")
  .delete(verifyToken, recycling.deleteRecyclingGuideHandler);

// ============================= recycling type =====================================
router.route("/recycling-type").get(recycling.getRecyclingTypeHandler);

router.route("/recycling-type").post(recycling.createRecyclingTypeHandler);

router.route("/recycling-type/:id").patch(recycling.updateRecyclingTypeHandler);

router
  .route("/recycling-type/:id")
  .delete(recycling.deleteRecyclingTypeHandler);

// router.get("/", verifyToken, auth.getUserHandler);

export default router;
