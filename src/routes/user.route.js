import express from "express";
import {
    renderUserProfilePage,
    renderUserOrderPage,
    apiGetAllCustomer,
    renderUserOrderDetailPage,
    updateNameUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", renderUserProfilePage);
router.get("/order", renderUserOrderPage);

// API
router.get('/api/get-all-customers', apiGetAllCustomer)
    
import { renderUserOrderReviewPage, reviewOrderHandler } from "../controllers/order.controller.js";

router.get("/profile", renderUserProfilePage);
router.get("/order/", renderUserOrderPage);
router.get("/order/:id", renderUserOrderDetailPage);
router.get("/order/review/:id", renderUserOrderReviewPage);
router.post("/order/review/", reviewOrderHandler);
router.post("/updateName", updateNameUser);
export default router;
