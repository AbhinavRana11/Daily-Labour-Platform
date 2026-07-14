import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowCustomer, allowWorker } from "../middleware/roleGuard.js";
import { addReview, getWorkerReviews, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, allowCustomer, addReview);
router.get("/:workerId", getWorkerReviews);
router.delete("/:id", protect, allowWorker, deleteReview);

export default router;
