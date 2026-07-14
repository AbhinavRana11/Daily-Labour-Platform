import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log("New Client Connected:", socket.id);

        // Join a room based on user ID (for private updates, like booking status)
        socket.on("join_room", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`User ${userId} joined private room ${userId}`);
            }
        });

        // 1. Join Chat Room
        socket.on("joinRoom", (chatId) => {
            if (chatId) {
                socket.join(chatId);
                console.log(`Client ${socket.id} joined chat room ${chatId}`);
            }
        });

        // 2. Send Message Room Broadcast
        socket.on("sendMessage", (messageData) => {
            const { chat } = messageData;
            io.to(chat).emit("receiveMessage", messageData);
        });

        // 3. Typing Indicators
        socket.on("typing", ({ chatId, userId, userName }) => {
            socket.to(chatId).emit("userTyping", { userId, userName, isTyping: true });
        });

        socket.on("stopTyping", ({ chatId, userId }) => {
            socket.to(chatId).emit("userTyping", { userId, isTyping: false });
        });

        // 4. Read Receipts
        socket.on("markRead", ({ chatId, userId }) => {
            socket.to(chatId).emit("messageRead", { chatId, userId });
        });

        // Legacy/Generic Chat Events support
        socket.on("send_message", ({ to, message, from }) => {
            console.log(`Message from ${from} to ${to}: ${message}`);
            io.to(to).emit("receive_message", {
                from,
                message,
                timestamp: new Date()
            });
        });

        socket.on("disconnect", () => {
            console.log("Client Disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
