console.log("Loading routes/auth.js");
import express from "express";
import { register, login, getLabours } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/labours", getLabours);

export default router;
