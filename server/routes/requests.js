import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createRequest,
    getMyRequirements,
    getRequestById,
    selectWorker,
    cancelRequest,
    getNearbyRequests
} from "../controllers/requestController.js";

const router = express.Router();

// Customer routes
router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequirements);
router.get("/nearby", protect, getNearbyRequests);
router.get("/:id", protect, getRequestById);
router.put("/:id/select-worker", protect, selectWorker);
router.delete("/:id", protect, cancelRequest);

export default router;
