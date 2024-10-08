import express from "express";
import { renderUserProfilePage } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/:id", renderUserProfilePage);

export default router;
