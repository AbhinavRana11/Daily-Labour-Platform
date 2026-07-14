import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getTrackingStatus, updateTrackingLocation, getTrackingETA } from "../controllers/trackingController.js";

const router = express.Router();

router.put("/update-location", protect, updateTrackingLocation);
router.get("/eta/:bookingId", protect, getTrackingETA);
router.get("/:bookingId", protect, getTrackingStatus);

export default router;
