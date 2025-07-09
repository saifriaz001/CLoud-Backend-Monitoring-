import UserStatus from '../models/UserStatus.js';
import ScheduledAnalysis from '../models/ScheduledAnalysis.js';


export const updateUserStatus = async (req, res) => {
    const userId = req.user?.userId;
    const { status, startTime, date } = req.body;


    console.log("📝 Updating status for user:", userId, "Status:", status, "Start Time:", startTime, "Date:", date);
    if (!status || !startTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let record = await UserStatus.findOne({ user: userId });

        if (!record) {
            record = await UserStatus.create({ user: userId, sessions: [] });
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

        if (status === 'online') {
            const existingSchedule = await ScheduledAnalysis.findOne({ user: userId, scheduled: true });

            const lastStatus = lastSession?.status;
            const isCurrentlyOnline = lastStatus === 'online' && !lastSession?.endTime;

            if (!existingSchedule && !isCurrentlyOnline) {
                await ScheduledAnalysis.create({
                    user: userId,
                    startTime: new Date(startTime),
                    scheduled: true,
                });
                console.log('🕓 Scheduled productivity analysis for user:', userId);
            } else {
                console.log('⏩ Skipped re-scheduling. Already tracked or still online.');
            }
        }



        return res.status(200).json({ message: 'Session added', session: newSession });
    } catch (err) {
        console.error('Error updating status:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCurrentUserStatus = async (req, res) => {
    const userId = req.user?.userId;
    console.log("🔍 Fetching status for user:", userId);

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user in token' });
    }

    try {
        const statusDoc = await UserStatus.findOne({ user: userId }).lean();

        if (!statusDoc || statusDoc.sessions.length === 0) {
            return res.status(200).json({ status: 'offline', startTime: null, date: null });
        }

        const lastSession = statusDoc.sessions[statusDoc.sessions.length - 1];

        return res.status(200).json({
            status: lastSession.status,
            startTime: lastSession.startTime,
            date: lastSession.date || null
        });
    } catch (err) {
        console.error('Error fetching user status:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};