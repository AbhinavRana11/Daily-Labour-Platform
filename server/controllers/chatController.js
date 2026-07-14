import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Booking from "../models/Booking.js";

// @desc    Create a Chat Room
// @route   POST /api/chat/create
// @access  Private
export const createChat = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify authorized role (worker or customer)
        if (booking.user.toString() !== req.user.id && booking.labour.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Find or Create Chat Room
        let chat = await Chat.findOne({ booking: bookingId });
        if (!chat) {
            chat = new Chat({
                booking: bookingId,
                customer: booking.user,
                worker: booking.labour,
                lastMessage: "Chat room created",
                lastMessageTime: new Date()
            });
            await chat.save();
        }

        res.status(201).json(chat);
    } catch (error) {
        console.error("Create Chat Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get user chats
// @route   GET /api/chat
// @access  Private
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find chats where user is customer or worker
        const chats = await Chat.find({
            $or: [{ customer: userId }, { worker: userId }]
        })
        .populate("customer", "username email phone")
        .populate("worker", "username profession rate phone")
        .populate("booking", "status date")
        .sort({ lastMessageTime: -1 });

        res.json(chats);
    } catch (error) {
        console.error("Get User Chats Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get messages for a chat room
// @route   GET /api/chat/:chatId
// @access  Private
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Check if user is participant
        if (chat.customer.toString() !== req.user.id && chat.worker.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to view messages" });
        }

        const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { chatId, message, messageType } = req.body;
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Verify participant
        const isCustomer = chat.customer.toString() === req.user.id;
        const isWorker = chat.worker.toString() === req.user.id;
        
        if (!isCustomer && !isWorker) {
            return res.status(401).json({ message: "Not authorized to send message" });
        }

        const senderId = req.user.id;
        const receiverId = isCustomer ? chat.worker : chat.customer;

        const newMessage = new Message({
            chat: chatId,
            sender: senderId,
            receiver: receiverId,
            message,
            messageType: messageType || "text"
        });

        const savedMessage = await newMessage.save();

        // Update Chat Room last message
        chat.lastMessage = messageType === "image" ? "📷 Image Sent" : message;
        chat.lastMessageTime = new Date();
        await chat.save();

        // Emit Socket Event if io is active
        try {
            const { getIO } = await import("../socket.js");
            const io = getIO();
            io.to(chatId).emit("receiveMessage", savedMessage);
        } catch (socketErr) {
            console.log("Socket emit failed (running in offline mode or sockets not initialized):", socketErr.message);
        }

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Mark chat as read
// @route   PUT /api/chat/read/:chatId
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        
        // Mark all messages sent to req.user.id in this chat as read
        await Message.updateMany(
            { chat: chatId, receiver: req.user.id, isRead: false },
            { isRead: true }
        );

        res.json({ message: "Chat marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
