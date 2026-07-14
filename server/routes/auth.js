import express from "express";
import { register, login, getLabours, updateLocation, updateProfile, updateAvailability, updatePrice, updateRadius, getLabourById, getUsers, deleteUser, deleteLabour } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/labours", getLabours);
router.get("/labours/:id", getLabourById);
router.delete("/labours/:id", protect, deleteLabour);
router.get("/users", protect, getUsers);
router.delete("/users/:id", protect, deleteUser);
router.put("/location", updateLocation);
router.put("/profile", protect, updateProfile);
router.put("/worker/availability", protect, updateAvailability);
router.put("/worker/price", protect, updatePrice);
router.put("/worker/radius", protect, updateRadius);

export default router;
