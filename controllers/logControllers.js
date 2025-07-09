import FileLog from '../models/FileLog.js'
import { Types } from 'mongoose';
import activeWindowSchema from "../models/ActiveWindowLog.js"
import RecordingSessionLog from '../models/RecordingSessionLog.js';
import ScreenshotLog from '../models/ScreenshotLog.js';
import UserStatus from '../models/UserStatus.js';

export const postScreenshotLogs = async (req, res) => {
  try {
    const logs = req.body;

    if (!Array.isArray(logs) || !logs.length) {
      return res.status(400).json({ error: 'Invalid log format' });
    }

    const savedLogs = await ScreenshotLog.insertMany(logs.map(log => ({
      user: req.userId,
      imageURL: log.imageURL,
      timestamp: log.timestamp, // Ensure timestamp is a Date object
    })));

    res.status(200).json({ message: `${savedLogs.length} logs saved.` });

  } catch (err) {
    console.error('❌ Error saving screenshot logs:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const saveFileLogs = async (req, res) => {
  try {
    const logs = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ msg: "No logs provided" });
    }

    // if (!req.user || !req.user._id) {
    //   return res.status(401).json({ msg: "Unauthorized: User not found in request" });
    // }


    // Attach user ID to each log
    const logsWithUser = logs.map(log => ({
      ...log,
      user: req.userId,
    }));

    await FileLog.insertMany(logsWithUser, { ordered: false });

    return res.status(200).json({ msg: `Saved ${logs.length} logs` });
  } catch (err) {
    console.error("❌ Log saving failed:", err.message);
    return res.status(500).json({ msg: "Failed to save logs", error: err.message });
  }
};

export const saveActiveWindowLogs = async (req, res) => {
  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body];

    const savedLogs = [];

    for (const entry of logs) {
      const { windowTitle, application, startTime, endTime, source, type } = entry;

      if (!windowTitle || !application || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const log = new activeWindowSchema({
        windowTitle,
        application,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        source,
        type,
        user: req.userId, // ✅ This is the fix
      });

      await log.save();
      savedLogs.push(log);
    }

    res.json({ success: true, saved: savedLogs.length });
  } catch (err) {
    console.error("❌ Error saving active window logs:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

export const recordingSessionLog = async (req, res) => {
  try {
    const userId = req.userId;
    const logs = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'No session logs provided' });
    }

    const enrichedLogs = logs.map(log => ({
      ...log,
      user: userId,
    }));

    await RecordingSessionLog.insertMany(enrichedLogs);
    res.json({ success: true, count: enrichedLogs.length });

  } catch (err) {
    console.error('❌ Failed to save session logs:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getActiveWindowLogsByHour = async (req, res) => {
  try {
    let { userId, date , startTime ,endTime } = req.query;
    
    // Step 1: Validate presence
    if (!userId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing userId, date, startTime, or endTime" });
    }



    console.log("🕒 Raw Inputs →", { startTime, endTime });

    // Step 3: Validate format (HH:mm)
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ error: "startTime and endTime must be in HH:mm format (e.g., 13:15)" });
    }

    const istStart = new Date(`${date}T${startTime.padStart(5, '0')}:00+05:30`);
    const istEnd = new Date(`${date}T${endTime.padStart(5, '0')}:00+05:30`);

    const utcStart = new Date(istStart.toISOString());
    const utcEnd = new Date(istEnd.toISOString());

    console.log("✅ UTC Range:", utcStart.toISOString(), "→", utcEnd.toISOString());

    // Step 5: Query
    const logs = await activeWindowSchema.find({
      user: userId,
      startTime: {
        $gte: utcStart,
        $lt: utcEnd
      }
    }).sort({ startTime: 1 });

    // Step 6: Format with IST output
    const logsWithIST = logs.map(log => ({
      ...log.toObject(),
      startTimeIST: new Date(log.startTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      }),
      endTimeIST: new Date(log.endTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      })
    }));

    res.json({ success: true, count: logsWithIST.length, logs: logsWithIST });

  } catch (err) {
    console.error("❌ Error fetching logs:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

export const getScreenshotLogsByTime = async (req, res) => {
  try {
    
    let { userId, date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'date, startTime, and endTime are required in HH:mm format' });
    }

    // Combine date and time into full ISO strings with IST offset
    const istStart = new Date(`${date}T${startTime.padStart(5, '0')}:00+05:30`);
    const istEnd = new Date(`${date}T${endTime.padStart(5, '0')}:00+05:30`);

    const utcStart = new Date(istStart.toISOString());
    const utcEnd = new Date(istEnd.toISOString());

    console.log("✅ UTC Range:", utcStart.toISOString(), "→", utcEnd.toISOString());

    const logs = await ScreenshotLog.find({
      user: userId,
      timestamp: {
        $gte: utcStart,
        $lt: utcEnd
      }
    }).sort({ timestamp: 1 });

    const logsWithIST = logs.map(log => ({
      ...log.toObject(),
      timestampIST: new Date(log.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      })
    }));

    return res.status(200).json({ success: true, count: logsWithIST.length, logs: logsWithIST });

  } catch (err) {
    console.error('❌ Error fetching screenshot logs:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFileLogsByTime = async (req, res) => {
  try {

    const { userId ,date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing date, startTime, or endTime" });
    }

    // Trim inputs and validate format
    const cleanStart = startTime.trim();
    const cleanEnd = endTime.trim();
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!timeRegex.test(cleanStart) || !timeRegex.test(cleanEnd)) {
      console.log("❌ Invalid time format:", cleanStart, cleanEnd);
      return res.status(400).json({ error: "startTime and endTime must be in HH:mm format (e.g., 13:15)" });
    }

    // Build full IST datetime strings
    const istStart = new Date(`${date}T${cleanStart}:00+05:30`);
    const istEnd = new Date(`${date}T${cleanEnd}:00+05:30`);

    // Convert to ISO string to match the format stored in DB
    const utcStart = istStart.toISOString();
    const utcEnd = istEnd.toISOString();

    console.log("⏱ UTC Query Range:", utcStart, "→", utcEnd);

    // Query MongoDB using string comparison (timestamps stored as strings)
    const logs = await FileLog.find({
      user: userId,
      timestamp: {
        $gte: utcStart,
        $lt: utcEnd
      }
    }).sort({ timestamp: 1 });

    // Attach readable IST timestamp
    const logsWithIST = logs.map(log => ({
      ...log.toObject(),
      timestampIST: new Date(log.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      })
    }));

    return res.json({ success: true, count: logsWithIST.length, logs: logsWithIST });

  } catch (err) {
    console.error("❌ Error fetching file logs:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  const userId = req.user?.userId;
  const { status, startTime, date } = req.body;
  

  console.log("📝 Updating status for user:", userId, "Status:", status, "Start Time:", startTime, "Date:", date);
  if ( !status || !startTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let record = await UserStatus.findOne({ user:userId });

    if (!record) {
      record = await UserStatus.create({ user:userId, sessions: [] });
    }

    const sessions = record.sessions;
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

    // Close the previous session if still open
    if (lastSession && !lastSession.endTime) {
      lastSession.endTime = new Date(startTime); // Mark end as the new session's start time
    }

    const newSession = {
      status,
      startTime: new Date(startTime),
      endTime: null
    };

    if (date) {
      newSession.date = date;
    }

    sessions.push(newSession);
    await record.save();

    return res.status(200).json({ message: 'Session added', session: newSession });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllActiveWindowLogsWithPagination = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing required query parameter: userId" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Step 1: Fetch total count
    const totalCount = await activeWindowSchema.countDocuments({ user: userId });

    // Step 2: Fetch paginated logs
    const logs = await activeWindowSchema.find({ user: userId })
      .sort({ startTime: -1 }) // newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Step 3: Format logs with IST for frontend
    const logsWithIST = logs.map(log => ({
      ...log.toObject(),
      startTimeIST: new Date(log.startTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      }),
      endTimeIST: new Date(log.endTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false
      })
    }));

    // Step 4: Return response with metadata
    res.status(200).json({
      success: true,
      count: logsWithIST.length,
      total: totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      logs: logsWithIST
    });

  } catch (err) {
    console.error("❌ Error fetching paginated active window logs:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

export const getAllScreenshotLogs = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing required query parameter: userId" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ScreenshotLog.countDocuments({ user: userId });

    const logs = await ScreenshotLog.find({ user: userId })
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      logs
    });

  } catch (err) {
    console.error('❌ Error fetching screenshot logs:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


export const getAllFileLogs = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing required query parameter: userId" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await FileLog.countDocuments({ user: userId });

    const logs = await FileLog.find({ user: userId })
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      logs
    });

  } catch (err) {
    console.error('❌ Error fetching screenshot logs:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};