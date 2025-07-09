import express from 'express';
import { getCurrentUserStatus, updateUserStatus } from '../controllers/dashboardController.js'
import { verifyUser } from '../middlewares/authMiddleware.js'; 


const router = express.Router();


router.post('/dashboard/update-status', verifyUser, updateUserStatus);
router.get('/dashboard/current-status', verifyUser, getCurrentUserStatus);

export default router;