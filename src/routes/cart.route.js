import express from "express";
import { renderCartPage } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", renderCartPage);

export default router;
