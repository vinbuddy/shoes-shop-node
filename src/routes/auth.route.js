import express from "express";
import passport from "passport";
import env from "dotenv";
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
    googleAuthCallbackHandler,
} from "../controllers/auth.controller.js";

env.config();
const router = express.Router();

router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/verify-otp", renderVerifyOTPPage);
router.get("/logout", logoutHandler);
router.get("/forgot", renderForgotPasswordPage);
router.get("/reset-password", renderResetPasswordPage);

// Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: process.env.BASE_URL, session: true }),
    googleAuthCallbackHandler
);

router.post("/register", registerHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/login", loginHandler);
router.post("/forgot", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

export default router;
