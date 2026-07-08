console.log("Loading models/Labour.js");
import mongoose from "mongoose";

const LabourSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        profession: { type: String, required: true }, // e.g., Plumber, Electrician
        experience: { type: Number }, // Years
        rate: { type: Number, required: true }, // Per hour
        bio: { type: String },
        profileImage: { type: String },
        portfolio: [{ type: String }], // Array of image URLs
        location: {
            address: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        isAvailable: { type: Boolean, default: true },
        rating: { type: Number, default: 0 },
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                rating: Number,
                comment: String,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Labour", LabourSchema);
