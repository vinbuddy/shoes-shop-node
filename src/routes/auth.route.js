import express from "express";
import { renderLoginPage, renderRegisterPage } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);

export default router;
