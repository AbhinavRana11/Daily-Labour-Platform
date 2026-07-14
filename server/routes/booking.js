import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowCustomer, allowWorker } from '../middleware/roleGuard.js';
import { createBooking, getBookings, updateBookingStatus, getBookingById, cancelBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.route("/")
    .post(protect, allowCustomer, createBooking)
    .get(protect, getBookings);

router.get("/user", protect, getBookings);
router.put("/cancel/:id", protect, cancelBooking);

router.route("/:id")
    .get(protect, getBookingById)
    .put(protect, updateBookingStatus);

export default router;
