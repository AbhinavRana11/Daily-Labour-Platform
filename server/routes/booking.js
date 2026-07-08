console.log("Loading routes/booking.js");
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBooking, getBookings, updateBookingStatus } from "../controllers/bookingController.js";

const router = express.Router();

router.route("/")
    .post(protect, createBooking)
    .get(protect, getBookings);

router.route("/:id")
    .put(protect, updateBookingStatus);

export default router;
