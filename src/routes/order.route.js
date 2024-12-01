import express from "express";
import {
    cancelOrderHandle,
    refundOrderHandle,
    completedOrderHandle,
    renderRefundClientPage,
    cancelRefundHandle,
} from "../controllers/order.controller.js";

const router = express.Router();
import multer from "multer";
const uploadFile = multer({ storage: multer.memoryStorage() });
router.get("/cancel/:id", cancelOrderHandle);
router.post(
    "/refund",
    uploadFile.fields([
        {
            name: "reasonImageFiles",
            maxCount: 10,
        },
    ]),
    refundOrderHandle
);
router.get("/completed/:id", completedOrderHandle);
router.get("/refundRequest/:id", renderRefundClientPage);
router.get("/cancelRefund/:id", cancelRefundHandle);

export default router;
