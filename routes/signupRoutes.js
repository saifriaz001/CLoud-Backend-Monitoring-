import express from "express";
import { getAllCompanies , createCompany , signup} from  "../controllers/signupController.js"

const router = express.Router()

router.post("/signup", signup)

router.post("/createCompanies", createCompany)
router.get ("/getCompany" , getAllCompanies)

export default router