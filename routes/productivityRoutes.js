import express from "express";
import { getAnalysisFromDb ,  getAllProductivityAnalysisForDay } from "../controllers/productivityControllers.js"
import { verifyUser } from '../middlewares/authMiddleware.js'; 

const router = express.Router();


router.get('/getProductivityAnalysis', verifyUser, getAnalysisFromDb);
router.get ("/getallproductivityanalysisforday", verifyUser, getAllProductivityAnalysisForDay);

export default router;
