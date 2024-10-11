import express from "express";
import { renderLoginPage, renderRegisterPage, registerHandler } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);

router.post("/register", registerHandler);

export default router;
