import express from "express";
import { cancelOrder, refundOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/cancel/:id", cancelOrder);
router.get("/refund/:id", refundOrder);

export default router;
