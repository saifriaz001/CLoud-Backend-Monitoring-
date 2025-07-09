// utils/scheduleProductivityAnalysis.js
import cron from 'node-cron';
import ScheduledAnalysis from '../models/ScheduledAnalysis.js';
import UserStatus from '../models/UserStatus.js';
//import { runProductivityAnalysis } from '../utils/runProductivityAnalysis.js';
import  writeToPendingFile  from "../productivityAnalysis/pendingFile.js";

export function scheduleProductivityAnalysis() {
  if (!global.__cron_initialized__) {
  global.__cron_initialized__ = true; 
    console.log('🕒 Initializing productivity analysis cron job...');
  cron.schedule('10 * * * * *', async () => {

    console.log(`[CRON START] ${new Date().toISOString()}`);
    const now = new Date();

    const scheduledUsers = await ScheduledAnalysis.find({ scheduled: true });

    for (const entry of scheduledUsers) {
      const { user, startTime } = entry;

      const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour mark
      const triggerTime = new Date(startTime.getTime() + 65 * 60000); // +5 min grace

      if (now >= triggerTime) {
        const userStatus = await UserStatus.findOne({ user });

        const sessionWindow = userStatus.sessions.filter(s =>
          new Date(s.startTime) >= startTime &&
          new Date(s.startTime) < endTime
        );
        console.log(`🔍 Checking sessions for user ${user} from ${startTime} to ${endTime} and the session is here ${sessionWindow}`);

        const hasOffline = sessionWindow.some(s => s.status === 'offline');

        if (hasOffline) {
          await ScheduledAnalysis.deleteOne({ _id: entry._id });
          console.log(`⛔ User ${user} went offline. Skipping re-schedule.`);
        } else {

           writeToPendingFile(user, sessionWindow, startTime, endTime);

          const nextStartTime = endTime;
          await ScheduledAnalysis.updateOne(
            { _id: entry._id },
            { startTime: nextStartTime }
          );

          console.log(`✅ Re-scheduled analysis for ${user} at ${nextStartTime}`);
        }
      }
    }
  });

  console.log('🕒 Scheduled productivity analysis cron job initialized.');
 }
}
