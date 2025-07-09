import { getActiveWindowLogs, getScreenshotLogs, getFileLogs } from "./dataFetcher.js";
import fs from 'fs/promises';
import path from 'path';
import { analyzeFrameWithGemini } from "./analyzeFrameWithGemini.js";
import { convertScreenshotsToBase64 } from "./imageToBase.js";
import {analyzeMultipleScreenshots} from "./screenshotanalyze.js"
import { saveAnalysisToDb } from "../controllers/productivityControllers.js";
function splitIntoFrames(startTime, endTime, frameSizeMinutes = 10) {
  const frames = [];
  let frameStart = new Date(startTime);

  while (frameStart < endTime) {
    const frameEnd = new Date(frameStart.getTime() + frameSizeMinutes * 60 * 1000);
    frames.push({ frameStart, frameEnd });
    frameStart = frameEnd;
  }

  return frames;
}

function filterLogsByFrame(logs, frameStart, frameEnd, timeField = 'startTime') {
  return logs.filter(log => {
    const timestamp = new Date(log[timeField]);
    return timestamp >= frameStart && timestamp < frameEnd;
  });
}

export async function runProductivityAnalysis() {
  const pendingPath = path.join(process.cwd(), 'pending_analysis.json');

  try {
    const content = await fs.readFile(pendingPath, 'utf-8');
    const entries = JSON.parse(content);

    if (!entries.length) {
      console.log('ℹ️ No pending productivity tasks to analyze.');
      return;
    }

    for (const entry of entries) {
      const { user, startTime, endTime, sessionWindow } = entry;

      if (!sessionWindow?.length) {
        console.warn(`⚠️ No session data for user ${user}, skipping.`);
        continue;
      }

      const sessionDate = new Date(sessionWindow[0].startTime).toISOString().split('T')[0];

      console.log(`📅 Analyzing user: ${user}, date: ${sessionDate}, range: ${startTime} - ${endTime}`);

      const [activeWindows, screenshots, fileLogs] = await Promise.all([
        getActiveWindowLogs(user, sessionDate, startTime, endTime),
        getScreenshotLogs(user, sessionDate, startTime, endTime),
        getFileLogs(user, sessionDate, startTime, endTime)
      ]);

      console.log(`🔍 Found ${activeWindows.length} active windows, ${screenshots.length} screenshots, and ${fileLogs.length} file logs for user ${user}.`);

      // const frames = splitIntoFrames(new Date(startTime), new Date(endTime), 10);

      // const framedResults = [];

      // for (const frame of frames) {
      //   const { frameStart, frameEnd } = frame;

      //   const frameActiveWindows = filterLogsByFrame(activeWindows, frameStart, frameEnd, 'startTime');
      //   const frameScreenshots = filterLogsByFrame(screenshots, frameStart, frameEnd, 'timestamp');
      //   const frameFileLogs = filterLogsByFrame(fileLogs, frameStart, frameEnd, 'timestamp');

      //   framedResults.push({
      //     frameStart,
      //     frameEnd,
      //     activeWindows: frameActiveWindows,
      //     screenshots: frameScreenshots,
      //     fileLogs: frameFileLogs
      //   });
      // }

      const base64screenshot= await convertScreenshotsToBase64( screenshots   )

      const geminJson= await analyzeMultipleScreenshots(  base64screenshot, activeWindows, fileLogs , startTime , endTime)

      await saveAnalysisToDb(user , geminJson)
 
      //await analyzeFrameWithGemini( activeWindows,fileLogs,screenshots,startTime,endTime)

      console.log(`✅ Done: Productivity analysis complete for user ${user}`);
    }

    console.log('🧹 No Cleared pending analysis file after processing instruction given.');

  } catch (err) {
    console.error('❌ Error running productivity analysis:', err);
  }
}
