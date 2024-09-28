import express from "express";
import { renderHomePage } from "../controllers/home.controller.js";

const router = express.Router();

router.get("/", renderHomePage);

export default router;
