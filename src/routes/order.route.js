import express from "express";
import { 
    cancelOrder,
    apiGetOrder
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/cancel/:id", cancelOrder);

// API
router.get('/api/get-all-success-order/:timeType', apiGetOrder)

export default router;
