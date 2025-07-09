import express from "express";
import { agentLogin,signup, login ,listSessions ,agentRefreshToken  } from "../controllers/authController.js";
import {  authenticateAgent } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post('/agent/login', agentLogin);                         

router.post('/agent/authenticate', authenticateAgent);

export default router;
