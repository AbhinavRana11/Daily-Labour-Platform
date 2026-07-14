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

        // Fetch labour location coordinates to store
        const labour = await Labour.findById(labourId);
        const workerLat = labour?.location?.coordinates?.[1] || 28.6200;
        const workerLng = labour?.location?.coordinates?.[0] || 77.2150;

        const customerLat = location?.coordinates?.lat || 28.6139;
        const customerLng = location?.coordinates?.lng || 77.2090;

        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const bookingId = `BK${randomCode}`;

        const booking = new Booking({
            bookingId,
            user: req.user.id,
            labour: labourId,
            date,
            scheduledTime: date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM',
            hours,
            totalPrice,
            estimatedPrice: totalPrice,
            finalPrice: totalPrice,
            customerAddress: location?.address || 'Delhi Area',
            customerLocation: {
                lat: customerLat,
                lng: customerLng
            },
            workerLocation: {
                lat: workerLat,
                lng: workerLng
            },
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
                .populate("labour", "username profession rate phone rating experience completedJobs")
                .sort({ createdAt: -1 });
        }

        res.json(bookings);
    } catch (error) {
        console.error("Get Bookings Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get individual booking details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("user", "username email phone")
            .populate("labour", "username profession rate phone rating experience completedJobs");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json(booking);
    } catch (error) {
        console.error("Get Booking By Id Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/cancel/:id
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized to cancel this booking" });
        }
        booking.status = 'cancelled';
        const updated = await booking.save();
        
        // Emit Socket.IO updates
        try {
            const { getIO } = await import("../socket.js");
            const io = getIO();
            io.to(booking.user.toString()).emit("booking_status_update", updated);
            io.to(booking.labour.toString()).emit("booking_status_update", updated);
        } catch (err) {
            console.error("Socket emit failed inside cancel booking:", err.message);
        }
        
        res.json(updated);
    } catch (error) {
        console.error("Cancel Booking Error:", error);
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

        // Verify authorization
        const isUserOwner = booking.user.toString() === req.user.id;
        const isLabourOwner = booking.labour.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isLabourOwner && !isAdmin) {
            // Customer can only cancel their own booking
            if (status === 'cancelled' && isUserOwner) {
                // Allowed
            } else {
                return res.status(401).json({ message: "Not authorized to update this booking status" });
            }
        }

        booking.status = status;
        const updatedBooking = await booking.save();

        // Automatically create a Chat Room if the booking is accepted
        if (status === 'accepted') {
            try {
                const Chat = (await import("../models/Chat.js")).default;
                let chat = await Chat.findOne({ booking: booking._id });
                if (!chat) {
                    chat = new Chat({
                        booking: booking._id,
                        customer: booking.user,
                        worker: booking.labour,
                        lastMessage: "Chat enabled - Booking Accepted",
                        lastMessageTime: new Date()
                    });
                    await chat.save();
                    console.log("Chat room automatically created for booking:", booking._id);
                }
            } catch (err) {
                console.error("Failed to automatically create chat room:", err.message);
            }
        }

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
