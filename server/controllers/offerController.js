import WorkerOffer from "../models/WorkerOffer.js";
import LabourRequest from "../models/LabourRequest.js";
import { getIO } from "../socket.js";

// ── Worker: Send offer on a request ───────────────────────────────────────────
export const createOffer = async (req, res) => {
    try {
        const { requestId, price, estimatedArrival, message } = req.body;

        const request = await LabourRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (!["open", "offers_received"].includes(request.status))
            return res.status(400).json({ message: "Request is no longer accepting offers" });

        // Check if already sent offer
        const existing = await WorkerOffer.findOne({ request: requestId, worker: req.user.id });
        if (existing) return res.status(400).json({ message: "You already sent an offer for this request" });

        const offer = await WorkerOffer.create({
            request: requestId,
            worker: req.user.id,
            price, estimatedArrival, message
        });

        await offer.populate("worker", "username profession rating phone experience completedJobs");

        // Update request status & offer count
        request.status = "offers_received";
        request.offersCount = (request.offersCount || 0) + 1;
        await request.save();

        // Notify customer
        try {
            const io = getIO();
            io.to(request.customer.toString()).emit("new_offer_received", {
                requestId: request._id,
                requestTitle: request.title,
                offer: {
                    _id: offer._id,
                    price,
                    estimatedArrival,
                    message,
                    worker: offer.worker
                }
            });
        } catch (e) {
            console.warn("Socket emit failed:", e.message);
        }

        res.status(201).json(offer);
    } catch (err) {
        console.error("createOffer error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ── Worker: Get my offers ──────────────────────────────────────────────────────
export const getMyOffers = async (req, res) => {
    try {
        const offers = await WorkerOffer.find({ worker: req.user.id })
            .populate({
                path: "request",
                populate: { path: "customer", select: "username phone" }
            })
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Worker: Update offer ───────────────────────────────────────────────────────
export const updateOffer = async (req, res) => {
    try {
        const offer = await WorkerOffer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        if (offer.worker.toString() !== req.user.id)
            return res.status(403).json({ message: "Not authorized" });
        if (offer.status !== "pending")
            return res.status(400).json({ message: "Cannot update offer that is already accepted/rejected" });

        const { price, estimatedArrival, message } = req.body;
        if (price) offer.price = price;
        if (estimatedArrival) offer.estimatedArrival = estimatedArrival;
        if (message !== undefined) offer.message = message;

        await offer.save();
        res.json(offer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Worker: Withdraw offer ─────────────────────────────────────────────────────
export const withdrawOffer = async (req, res) => {
    try {
        const offer = await WorkerOffer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Not found" });
        if (offer.worker.toString() !== req.user.id)
            return res.status(403).json({ message: "Not authorized" });

        offer.status = "withdrawn";
        await offer.save();

        // Decrease offer count on request
        await LabourRequest.findByIdAndUpdate(offer.request, { $inc: { offersCount: -1 } });

        res.json({ message: "Offer withdrawn" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
