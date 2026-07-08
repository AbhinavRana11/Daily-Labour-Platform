import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173", // Vite default port
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log("New Client Connected:", socket.id);

        // Join a room based on user ID (for private updates)
        socket.on("join_room", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`User ${userId} joined room ${userId}`);
            }
        });

        // Chat Events
        socket.on("send_message", ({ to, message, from }) => {
            console.log(`Message from ${from} to ${to}: ${message}`);
            // Send to recipient
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
