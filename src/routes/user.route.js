import express from "express";
import {
    renderUserProfilePage,
    renderUserOrderPage,
    renderUserOrderDetailPage,
    updateNameUser,
} from "../controllers/user.controller.js";
import { renderUserOrderReviewPage, reviewOrderHandler } from "../controllers/order.controller.js";
const router = express.Router();

router.get("/profile", renderUserProfilePage);
router.get("/order/", renderUserOrderPage);
router.get("/order/:id", renderUserOrderDetailPage);
router.get("/order/review/:id", renderUserOrderReviewPage);
router.post("/order/review/", reviewOrderHandler);
router.post("/updateName", updateNameUser);
export default router;
