import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createOffer,
    getMyOffers,
    updateOffer,
    withdrawOffer
} from "../controllers/offerController.js";

const router = express.Router();

router.post("/", protect, createOffer);
router.get("/my", protect, getMyOffers);
router.put("/:id", protect, updateOffer);
router.delete("/:id", protect, withdrawOffer);

export default router;
