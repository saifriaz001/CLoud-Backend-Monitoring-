import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DeviceAuth from '../models/DeviceAuth.js';


const DEVICE_SECRET_KEY = process.env.DEVICE_SECRET;

export const authenticateAgent = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode token
    const payload = jwt.verify(token, DEVICE_SECRET_KEY);
    const { userId } = payload;

    // Validate against DeviceAuth record
    const deviceAuth = await DeviceAuth.findOne({ deviceToken: token });
    if (!deviceAuth || deviceAuth.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Token expired or invalid' });
    }

    // Attach user/device info to request
    req.userId = userId;
    req.deviceId = deviceAuth.deviceId;
    req.deviceToken = token;

    // Update lastSeen
    deviceAuth.lastSeen = new Date();
    await deviceAuth.save();

    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


export const verifyUser = (req, res, next) => {
  const token = req.cookies.accessToken; 

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.id.userId };
    next();
  } catch (err) {
    console.error('Invalid token', err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};