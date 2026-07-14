import Tracking from "../models/Tracking.js";
import Booking from "../models/Booking.js";
import { getIO } from "../socket.js";

// Haversine formula to compute distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
};

// @desc    Get tracking status for a booking
// @route   GET /api/tracking/:bookingId
// @access  Private
export const getTrackingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate("labour", "username phone profession location");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (!booking.labour) {
            return res.status(400).json({ message: "Booking has no assigned worker" });
        }

        let tracking = await Tracking.findOne({ worker: booking.labour._id });
        if (!tracking) {
            // Initialize mock tracking if not found
            const defaultWorkerLat = booking.workerLocation?.lat || booking.labour?.location?.coordinates?.[1] || 28.6200;
            const defaultWorkerLng = booking.workerLocation?.lng || booking.labour?.location?.coordinates?.[0] || 77.2150;
            tracking = new Tracking({
                worker: booking.labour._id,
                latitude: defaultWorkerLat,
                longitude: defaultWorkerLng,
                isTracking: true
            });
            await tracking.save();
        }

        const customerLat = booking.customerLocation?.lat || booking.location?.coordinates?.lat || 28.6139;
        const customerLng = booking.customerLocation?.lng || booking.location?.coordinates?.lng || 77.2090;

        const distance = calculateDistance(customerLat, customerLng, tracking.latitude, tracking.longitude);
        const eta = Math.round((distance / 32) * 60) || 5; // Assumed speed 32 km/h, fallback 5 mins

        res.json({
            bookingId: booking._id,
            worker: booking.labour,
            status: booking.status,
            latitude: tracking.latitude,
            longitude: tracking.longitude,
            customerLocation: { lat: customerLat, lng: customerLng },
            isTracking: tracking.isTracking,
            distance: Number(distance.toFixed(1)),
            eta: eta,
            speed: 32, // km/h
            lastUpdated: tracking.lastUpdated
        });
    } catch (error) {
        console.error("Get Tracking Status Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update worker location
// @route   PUT /api/tracking/update-location
// @access  Private (Worker)
export const updateTrackingLocation = async (req, res) => {
    try {
        const { latitude, longitude, isTracking, bookingId } = req.body;
        const workerId = req.user.id;

        let tracking = await Tracking.findOne({ worker: workerId });
        if (!tracking) {
            tracking = new Tracking({ worker: workerId, latitude, longitude });
        }

        tracking.latitude = Number(latitude);
        tracking.longitude = Number(longitude);
        tracking.lastUpdated = new Date();
        if (typeof isTracking === 'boolean') {
            tracking.isTracking = isTracking;
        }

        await tracking.save();

        // Emit Socket.IO Event real-time update to Customer if bookingId is provided
        if (bookingId) {
            try {
                const io = getIO();
                io.to(bookingId).emit("workerLocationUpdated", {
                    bookingId,
                    latitude: tracking.latitude,
                    longitude: tracking.longitude,
                    lastUpdated: tracking.lastUpdated
                });
                console.log(`Socket emitted location update for booking: ${bookingId}`);
            } catch (err) {
                console.error("Socket emit failed inside tracking update:", err.message);
            }
        }

        res.json(tracking);
    } catch (error) {
        console.error("Update Tracking Location Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get tracking ETA parameters
// @route   GET /api/tracking/eta/:bookingId
// @access  Private
export const getTrackingETA = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const tracking = await Tracking.findOne({ worker: booking.labour });
        if (!tracking) {
            return res.status(404).json({ message: "Tracking log not found for worker" });
        }

        const customerLat = booking.customerLocation?.lat || booking.location?.coordinates?.lat || 28.6139;
        const customerLng = booking.customerLocation?.lng || booking.location?.coordinates?.lng || 77.2090;

        const distance = calculateDistance(customerLat, customerLng, tracking.latitude, tracking.longitude);
        const eta = Math.round((distance / 32) * 60) || 5;

        res.json({
            distance: Number(distance.toFixed(1)),
            eta: eta,
            speed: 32,
            lastUpdated: tracking.lastUpdated
        });
    } catch (error) {
        console.error("Get Tracking ETA Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
