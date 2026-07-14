console.log("Loading models/Labour.js");
import mongoose from "mongoose";

const LabourSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        role: { type: String, default: "labour" },
        profession: { type: String, required: true }, // e.g., Plumber, Electrician
        experience: { type: Number }, // Years
        rate: { type: Number, required: true }, // Per hour
        bio: { type: String },
        profileImage: { type: String },
        portfolio: [{ type: String }], // Array of image URLs
        skills: [{ type: String }],
        certificates: [{ type: String }],
        videoIntro: { type: String },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [77.2090, 28.6139]
            },
            address: String
        },
        isAvailable: { type: Boolean, default: true },
        serviceRadius: { type: Number, default: 10 }, // Service radius in km
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

LabourSchema.index({ location: "2dsphere" });

export default mongoose.model("Labour", LabourSchema);
