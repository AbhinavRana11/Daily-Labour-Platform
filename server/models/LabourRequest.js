import mongoose from "mongoose";
import crypto from "crypto";

const LabourRequestSchema = new mongoose.Schema(
    {
        requestId: { type: String, unique: true, default: () => `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}` },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        service: {
            type: String,
            enum: ["Electrician", "Plumber", "Painter", "Carpenter", "Mason", "Housekeeper", "Cleaner", "Gardener", "Mechanic", "Other"],
            required: true
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        urgency: {
            type: String,
            enum: ["emergency", "today", "tomorrow", "scheduled"],
            default: "today"
        },
        date: { type: Date },
        time: { type: String },
        budgetMin: { type: Number, default: 200 },
        budgetMax: { type: Number, default: 1000 },
        budgetType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        images: [{ type: String }],
        status: {
            type: String,
            enum: ["open", "offers_received", "confirmed", "cancelled", "completed"],
            default: "open"
        },
        selectedWorker: { type: mongoose.Schema.Types.ObjectId, ref: "Labour" },
        selectedOffer: { type: mongoose.Schema.Types.ObjectId, ref: "WorkerOffer" },
        contactPreference: { type: String, enum: ["chat", "call", "both"], default: "both" },
        preferredWorker: [{
            type: String,
            enum: ["experienced", "verified", "highest_rated", "nearest"]
        }],
        offersCount: { type: Number, default: 0 },
        autoBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }
    },
    { timestamps: true }
);

export default mongoose.model("LabourRequest", LabourRequestSchema);
