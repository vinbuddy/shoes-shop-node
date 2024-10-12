import express from "express";
import {
    renderLoginPage,
    renderRegisterPage,
    registerHandler,
    renderVerifyOTPPage,
    verifyOTPHandler,
    logoutHandler,
    loginHandler,
    renderForgotPasswordPage,
    forgotPasswordHandler,
    renderResetPasswordPage,
    resetPasswordHandler,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/verify-otp", renderVerifyOTPPage);
router.get("/logout", logoutHandler);
router.get("/forgot", renderForgotPasswordPage);
router.get("/reset-password", renderResetPasswordPage);

router.post("/register", registerHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/login", loginHandler);
router.post("/forgot", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

export default router;
