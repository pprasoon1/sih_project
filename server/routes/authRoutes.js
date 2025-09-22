import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
