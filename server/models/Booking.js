import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        bookingId: { type: String, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        labour: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "started", "on_the_way", "arrived", "completed", "rejected", "cancelled"],
            default: "pending",
        },
        date: { type: Date, required: true },
        scheduledTime: { type: String },
        hours: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        estimatedPrice: { type: Number },
        finalPrice: { type: Number },
        notes: { type: String },
        customerAddress: { type: String },
        customerLocation: {
            lat: Number,
            lng: Number
        },
        workerLocation: {
            lat: Number,
            lng: Number
        },
        location: {
            address: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
        reviewGiven: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
