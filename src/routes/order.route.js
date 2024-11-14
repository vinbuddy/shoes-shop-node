import express from "express";
import { cancelOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/cancel/:id", cancelOrder);

export default router;
