import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        labour: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
            default: "pending",
        },
        date: { type: Date, required: true },
        hours: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        notes: { type: String },
        location: {
            address: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
