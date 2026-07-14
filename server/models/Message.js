import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
        message: { type: String, required: true },
        messageType: { type: String, enum: ["text", "image"], default: "text" },
        isRead: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
