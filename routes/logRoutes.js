import express from 'express';
import { saveFileLogs, 
     saveActiveWindowLogs , 
     recordingSessionLog , postScreenshotLogs , 
     getActiveWindowLogsByHour , getScreenshotLogsByTime , 
     getFileLogsByTime ,  getAllActiveWindowLogsWithPagination ,getAllScreenshotLogs, getAllFileLogs } from '../controllers/logControllers.js';
import { authenticateAgent ,verifyUser } from '../middlewares/authMiddleware.js'; 


const router = express.Router();

router.post('/logs', authenticateAgent, saveFileLogs);

router.post('/active-window-logs',authenticateAgent, saveActiveWindowLogs);

router.post ("/recording-session-logs", authenticateAgent, recordingSessionLog);

router.post("/screenshot-logs", authenticateAgent, postScreenshotLogs);



router.get ('/active-window-logs/by-time',  getActiveWindowLogsByHour);

router.get('/screenshot-logs/by-time',  getScreenshotLogsByTime);

router.get("/file-logs/by-time",  getFileLogsByTime);  

router.get('/active-window-logs/pagination',  getAllActiveWindowLogsWithPagination);

router.get('/screenshot-logs', getAllScreenshotLogs);

router.get('/file-logs', getAllFileLogs);

export default router;
