import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { initSocket } from "./socket.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/daily_labour")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

import adminRouter from "./routes/admin.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import trackingRoutes from "./routes/tracking.js";
import requestRoutes from "./routes/requests.js";
import offerRoutes from "./routes/offers.js";

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/tracking", trackingRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/offers", offerRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Create HTTP Server & Init Socket
const httpServer = createServer(app);
initSocket(httpServer);

// Start Server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
