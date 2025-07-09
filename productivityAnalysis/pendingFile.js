// productivityAnalysis/pendingFile.js
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.resolve('./pending_analysis.json');

export default function writeToPendingFile(user, sessionWindow, startTime, endTime) {
  let data = [];

  // Read existing entries if file exists
  if (fs.existsSync(FILE_PATH)) {
    try {
      const raw = fs.readFileSync(FILE_PATH, 'utf-8');
      data = JSON.parse(raw || '[]');
    } catch (err) {
      console.error("❌ Error reading pending_analysis.json:", err.message);
    }
  }

  // Only use startTime and endTime from scheduler
  const entry = {
    user,
    startTime: startTime, // keep as ISO string or Date depending on how you're consuming it later
    endTime: endTime,
    sessionWindow
  };

  data.push(entry);

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  console.log(`📝 Appended to pending_analysis.json → user: ${user}`);
}
