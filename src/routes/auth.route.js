import express from "express";
import {
    renderLoginPage,
    renderRegisterPage,
    registerHandler,
    renderVerifyOTPPage,
    verifyOTPHandler,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/verify-otp", renderVerifyOTPPage);

router.post("/register", registerHandler);
router.post("/verify-otp", verifyOTPHandler);

export default router;
