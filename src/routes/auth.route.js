import express from "express";
import {
    renderLoginPage,
    renderRegisterPage,
    registerHandler,
    renderVerifyOTPPage,
    verifyOTPHandler,
    logoutHandler,
    loginHandler,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/verify-otp", renderVerifyOTPPage);
router.get("/logout", logoutHandler);

router.post("/register", registerHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/login", loginHandler);

export default router;
