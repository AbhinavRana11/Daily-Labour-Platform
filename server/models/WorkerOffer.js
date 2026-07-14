import mongoose from "mongoose";

const WorkerOfferSchema = new mongoose.Schema(
    {
        request: { type: mongoose.Schema.Types.ObjectId, ref: "LabourRequest", required: true },
        worker: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
        price: { type: Number, required: true },
        estimatedArrival: { type: String, default: "30 Minutes" },
        message: { type: String, default: "" },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "withdrawn"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("WorkerOffer", WorkerOfferSchema);
