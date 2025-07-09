import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config.js/db.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { handleSocketConnection } from './ws/socketHandler.js';
import { scheduleProductivityAnalysis } from './cron/scheduleProductivityAnalysis.js';
import { runProductivityAnalysis } from './productivityAnalysis/runProductivityAnalysis.js';
import productivityRoutes from "./routes/productivityRoutes.js"
dotenv.config();
const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ port: process.env.WS_PORT });

wss.on('connection', (socket, request) => {
  request.wss = wss; // Pass wss to socketHandler
  handleSocketConnection(socket, request);
});
console.log(`🚀 WebSocket Server Port: ${process.env.WS_PORT}`);

//Middlewares

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

await connectDb();
scheduleProductivityAnalysis();
runProductivityAnalysis();

// Routes
app.use("/api/v1", authRoutes);
app.use('/api/v1', logRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', productivityRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
