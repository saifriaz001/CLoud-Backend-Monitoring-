// utils/dataFetcher.js
import activeWindowSchema  from '../models/ActiveWindowLog.js';
import ScreenshotLog from '../models/ScreenshotLog.js';
import FileLog from '../models/FileLog.js';

export async function getActiveWindowLogs(userId, date, startTime, endTime) {
  return activeWindowSchema.find({
  user: userId,
  $or: [
    {
      startTime: { $gte: startTime, $lt: endTime }
    },
    {
      startTime: { $lt: startTime },
      endTime: { $gt: startTime }
    }
  ]
}).sort({ startTime: 1 })};


export async function getScreenshotLogs(userId, date,  startTime, endTime) {
  return ScreenshotLog.find({
    user: userId,
    timestamp: { $gte: startTime, $lt: endTime }
  }).sort({ timestamp: 1 });
}

export async function getFileLogs(userId, date,  startTime, endTime) {
  return FileLog.find({
    user: userId,
    timestamp: { $gte: startTime, $lt: endTime }
  }).sort({ timestamp: 1 });
}
