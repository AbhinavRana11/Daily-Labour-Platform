import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        worker: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true },
        lastMessage: { type: String, default: "" },
        lastMessageTime: { type: Date }
    },
    { timestamps: true }
);

// Prevent duplicate chats for the same booking
ChatSchema.index({ booking: 1 }, { unique: true });

export default mongoose.model("Chat", ChatSchema);
