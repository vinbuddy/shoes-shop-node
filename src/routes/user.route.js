import express from "express";
import {
    renderUserProfilePage,
    renderUserOrderPage,
    renderUserOrderDetailPage,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", renderUserProfilePage);
router.get("/order/", renderUserOrderPage);
router.get("/order/:id", renderUserOrderDetailPage);
export default router;
