import LabourRequest from "../models/LabourRequest.js";
import WorkerOffer from "../models/WorkerOffer.js";
import Booking from "../models/Booking.js";
import Labour from "../models/Labour.js";
import { getIO } from "../socket.js";

// ── Customer: Post a new requirement ──────────────────────────────────────────
export const createRequest = async (req, res) => {
    try {
        const {
            service, title, description, urgency, date, time,
            budgetMin, budgetMax, budgetType, address, lat, lng,
            images, contactPreference, preferredWorker
        } = req.body;

        const request = await LabourRequest.create({
            customer: req.user.id,
            service, title, description, urgency,
            date: date ? new Date(date) : new Date(),
            time, budgetMin, budgetMax, budgetType,
            address, lat, lng,
            images: images || [],
            contactPreference, preferredWorker: preferredWorker || []
        });

        await request.populate("customer", "username email phone");

        // Notify all connected workers via socket
        try {
            const io = getIO();
            io.emit("new_request_nearby", {
                requestId: request._id,
                service: request.service,
                title: request.title,
                urgency: request.urgency,
                budgetMin: request.budgetMin,
                budgetMax: request.budgetMax,
                address: request.address,
                lat: request.lat,
                lng: request.lng,
                date: request.date,
                time: request.time,
                createdAt: request.createdAt
            });
        } catch (e) {
            console.warn("Socket emit failed:", e.message);
        }

        res.status(201).json(request);
    } catch (err) {
        console.error("createRequest error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ── Customer: Get my requirements ─────────────────────────────────────────────
export const getMyRequirements = async (req, res) => {
    try {
        const requests = await LabourRequest.find({ customer: req.user.id })
            .populate("selectedWorker", "username profession rating phone")
            .sort({ createdAt: -1 });

        // Attach offer count + offer list for each
        const results = await Promise.all(requests.map(async (r) => {
            const offers = await WorkerOffer.find({ request: r._id, status: { $ne: "withdrawn" } })
                .populate("worker", "username profession rating phone experience completedJobs");
            return { ...r.toObject(), offers };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Customer: Get single requirement ──────────────────────────────────────────
export const getRequestById = async (req, res) => {
    try {
        const request = await LabourRequest.findById(req.params.id)
            .populate("customer", "username email phone")
            .populate("selectedWorker", "username profession rating phone");

        if (!request) return res.status(404).json({ message: "Request not found" });

        const offers = await WorkerOffer.find({ request: request._id, status: { $ne: "withdrawn" } })
            .populate("worker", "username profession rating phone experience completedJobs");

        res.json({ ...request.toObject(), offers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Customer: Select a worker offer → auto-create booking ─────────────────────
export const selectWorker = async (req, res) => {
    try {
        const { offerId } = req.body;
        const request = await LabourRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.customer.toString() !== req.user.id)
            return res.status(403).json({ message: "Not authorized" });

        const offer = await WorkerOffer.findById(offerId).populate("worker");
        if (!offer) return res.status(404).json({ message: "Offer not found" });

        // Create booking automatically
        const booking = await Booking.create({
            user: req.user.id,
            labour: offer.worker._id,
            status: "accepted",
            date: request.date || new Date(),
            scheduledTime: request.time || "09:00 AM",
            hours: 2,
            totalPrice: offer.price,
            estimatedPrice: offer.price,
            notes: request.description,
            customerAddress: request.address,
            customerLocation: { lat: request.lat, lng: request.lng }
        });

        // Update request status
        request.status = "confirmed";
        request.selectedWorker = offer.worker._id;
        request.selectedOffer = offerId;
        request.autoBookingId = booking._id;
        await request.save();

        // Reject other offers
        await WorkerOffer.updateMany(
            { request: request._id, _id: { $ne: offerId } },
            { status: "rejected" }
        );
        offer.status = "accepted";
        await offer.save();

        // Notify worker
        try {
            const io = getIO();
            io.to(offer.worker._id.toString()).emit("offer_accepted", {
                requestId: request._id,
                bookingId: booking._id,
                message: "Your offer was accepted! Customer confirmed booking.",
                customerName: req.user.username
            });
        } catch (e) {}

        res.json({ request, booking });
    } catch (err) {
        console.error("selectWorker error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ── Customer: Cancel request ───────────────────────────────────────────────────
export const cancelRequest = async (req, res) => {
    try {
        const request = await LabourRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Not found" });
        if (request.customer.toString() !== req.user.id)
            return res.status(403).json({ message: "Not authorized" });

        request.status = "cancelled";
        await request.save();

        try {
            const io = getIO();
            io.emit("request_cancelled", { requestId: request._id });
        } catch (e) {}

        res.json({ message: "Request cancelled", request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Worker: Get nearby open requests ──────────────────────────────────────────
export const getNearbyRequests = async (req, res) => {
    try {
        const { service, lat, lng } = req.query;

        const filter = { status: { $in: ["open", "offers_received"] } };
        if (service && service !== "all") filter.service = service;

        const requests = await LabourRequest.find(filter)
            .populate("customer", "username")
            .sort({ createdAt: -1 })
            .limit(50);

        // Calculate distance if coordinates provided
        const withDistance = requests.map(r => {
            let distance = null;
            if (lat && lng && r.lat && r.lng) {
                const R = 6371;
                const dLat = (r.lat - parseFloat(lat)) * Math.PI / 180;
                const dLon = (r.lng - parseFloat(lng)) * Math.PI / 180;
                const a = Math.sin(dLat/2)**2 +
                    Math.cos(parseFloat(lat) * Math.PI/180) *
                    Math.cos(r.lat * Math.PI/180) *
                    Math.sin(dLon/2)**2;
                distance = (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
            }
            return { ...r.toObject(), distance };
        });

        res.json(withDistance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
