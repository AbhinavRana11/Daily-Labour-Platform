import mongoose from "mongoose";

const TrackingSchema = new mongoose.Schema(
    {
        worker: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        lastUpdated: { type: Date, default: Date.now },
        isTracking: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("Tracking", TrackingSchema);
