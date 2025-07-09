import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import DeviceAuth from '../models/DeviceAuth.js';

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate and hash permanent deviceSecret
    const rawDeviceSecret = crypto.randomBytes(32).toString('hex'); // 64-char
    const hashedDeviceSecret = await bcrypt.hash(rawDeviceSecret, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      deviceSecret: hashedDeviceSecret
    });

    // Return raw deviceSecret (expose only once)
    res.status(201).json({
      success: true,
      email: user.email,
      deviceSecret: rawDeviceSecret
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (!password || !user.passwordHash) {
      return res.status(400).json({ msg: "Invalid input", err: "Missing password hash or input password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ msg: "Invalid password" });


    const accessToken = createAccessToken({ userId: user._id, expiresAt: Date.now() + 6 * 60 * 60 * 1000 }); // 6 hours
     console.log("✅ Access Token Created:", accessToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 6 * 60 * 60 * 1000,
    });


    res.json({
      message: "Login Successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Login error", err: err.message });
  }
};

const createAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET );
};

export const revokeSession = async (req, res) => {
  const { deviceId } = req.body;

  const deleted = await RefreshToken.deleteOne({ user: req.user._id, deviceId });

  if (deleted.deletedCount === 0)
    return res.status(404).json({ msg: "Device session not found" });

  res.json({ msg: `Device ${deviceId} logged out.` });
};

export const listSessions = async (req, res) => {
  const sessions = await RefreshToken.find({ user: req.user._id }).select('-token -__v');
  res.json({ sessions });
};


export const agentRefreshToken = async (req, res) => {
    const { deviceId } = req.body;

    try {
        if (!deviceId) {
            return res.status(400).json({ msg: "Missing device ID" });
        }

        // Lookup existing refresh token for the device
        const stored = await RefreshToken.findOne({ deviceId }).populate("user");

        if (!stored || stored.expiresAt < Date.now()) {
            return res.status(403).json({ msg: "Old or invalid session. Login required." });
        }

        // Generate new refresh token
        const newRefreshToken = jwt.sign(
            { userId: stored.user._id, deviceId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Update DB
        stored.token = newRefreshToken;
        stored.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await stored.save();

        // Set secure cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });


        // Return both tokens in JSON
        res.json({
            message: "Refresh successful",
            refreshToken: newRefreshToken, // <-- Now accessible to agent
            user: {
                id: stored.user._id,
                email: stored.user.email
            }
        });

    } catch (err) {
        res.status(500).json({ msg: "Error refreshing token", error: err.message });
    }
};



const DEVICE_SECRET_KEY = process.env.DEVICE_SECRET 

export const agentLogin = async (req, res) => {
  const { email, deviceSecret, deviceId } = req.body;

  if (!email || !deviceSecret || !deviceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Step 1: Validate user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Step 2: Validate permanent deviceSecret
    const validSecret = await bcrypt.compare(deviceSecret, user.deviceSecret);
    if (!validSecret) return res.status(401).json({ error: 'Invalid device secret' });

    // Step 3: Generate JWT device token
    const tokenExpiryMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    const expiresAt = new Date(Date.now() + tokenExpiryMs);
    const deviceToken = jwt.sign({ userId: user._id }, DEVICE_SECRET_KEY, { expiresIn: tokenExpiryMs / 1000 });

    // Step 4: Save or update device record
    const deviceAuth = await DeviceAuth.findOne({ deviceId });

    if (!deviceAuth) {
      await DeviceAuth.create({
        userId: user._id,
        deviceId,
        deviceToken,
        expiresAt,
        lastSeen: new Date()
      });
    } else {
      deviceAuth.deviceToken = deviceToken;
      deviceAuth.expiresAt = expiresAt;
      deviceAuth.lastSeen = new Date();
      await deviceAuth.save();
    }

    // ✅ Final response
    res.json({
      success: true,
      deviceToken,
      email: user.email,
      expiresAt: expiresAt.toISOString()
    });

  } catch (err) {
    console.error('Agent login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};