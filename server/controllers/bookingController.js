import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Labour from "../models/Labour.js";

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
export const createBooking = async (req, res) => {
    try {
        console.log("Create Booking Body:", req.body);
        const { labourId, date, hours, totalPrice, location, notes } = req.body;

        const booking = new Booking({
            user: req.user.id,
            labour: labourId,
            date,
            hours,
            totalPrice,
            location,
            notes,
            status: 'pending'
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get bookings for logged in user or labour
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
    try {
        const role = req.user.role;
        let bookings;

        if (role === 'labour') {
            bookings = await Booking.find({ labour: req.user.id })
                .populate("user", "username email phone")
                .sort({ createdAt: -1 });
        } else {
            bookings = await Booking.find({ user: req.user.id })
                .populate("labour", "username profession rate phone")
                .sort({ createdAt: -1 });
        }

        res.json(bookings);
    } catch (error) {
        console.error("Get Bookings Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update booking status (Accept/Reject)
// @route   PUT /api/bookings/:id
// @access  Private (Labour)
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted', 'rejected', 'completed'
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify that the labour owns this booking
        if (booking.labour.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        booking.status = status;
        const updatedBooking = await booking.save();

        // Emit real-time update to the User
        const { getIO } = await import("../socket.js");
        const io = getIO();
        io.to(booking.user.toString()).emit("booking_status_update", updatedBooking);

        res.json(updatedBooking);

    } catch (error) {
        console.error("Update Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
