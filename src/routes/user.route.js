import express from "express";
import { renderUserProfilePage, renderUserOrderPage } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", renderUserProfilePage);
router.get("/order", renderUserOrderPage);
export default router;
