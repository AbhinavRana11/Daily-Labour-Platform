console.log("Loading models/User.js");
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        role: { type: String, enum: ['customer','worker','admin'], default: 'customer' },
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
