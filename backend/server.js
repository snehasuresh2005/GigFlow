import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import gigRoutes from "./routes/gigs.js";
import bidRoutes from "./routes/bids.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

/* ------------------ CORS CONFIG (UPDATED) ------------------ */
const allowedOrigins = [
  process.env.CLIENT_URL,                      // Reads from Render Env Vars
  "http://localhost:5173",                     // Local development
  "https://gig-flow-rho.vercel.app",           // Your main Vercel domain
  "https://gig-flow-frontend.vercel.app",      // Your alternate Vercel domain
  
  // 👇 THIS IS THE CRITICAL FIX 👇
  // This matches the URL in your screenshot exactly
  "https://snehasuresh358-gmailcoms-projects.vercel.app" 
].filter(Boolean);

console.log("Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Required for cookies/JWT
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ------------------ MIDDLEWARE ------------------ */
app.use(express.json());
app.use(cookieParser());

/* ------------------ SOCKET.IO ------------------ */
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Re-use the same origins for WebSockets
    credentials: true
  }
});

// Socket authentication
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split("token=")[1]
        ?.split(";")[0];

    if (!token) {
      return next(new Error("Authentication error: No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket connection
io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.userId}`);

  socket.join(`user:${socket.userId}`);

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.userId}`);
  });

  socket.on("ping", () => {
    socket.emit("pong", { time: new Date().toISOString() });
  });
});

// Make io available in routes
app.set("io", io);

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

/* ------------------ HEALTH CHECK ------------------ */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "GigFlow API is running"
  });
});

/* ------------------ DATABASE + SERVER ------------------ */
const PORT = process.env.PORT || 5000;
console.log("MONGODB_URI loaded:", !!process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;