import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
        worker: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String },
        images: [{ type: String }], // Optional image uploads
        reply: { type: String } // Optional worker reply
    },
    { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
