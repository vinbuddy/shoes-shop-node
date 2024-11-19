import express from "express";
import {
    cancelOrderHandle,
    refundOrderHandle,
    completedOrderHandle,
    renderRefundPage,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/cancel/:id", cancelOrderHandle);
router.post("/refund/:id", refundOrderHandle);
router.get("/completed/:id", completedOrderHandle);
router.get("/refundRequest/:id", renderRefundPage);
export default router;
