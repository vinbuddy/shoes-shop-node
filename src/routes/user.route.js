import express from "express";
import {
    renderUserProfilePage,
    renderUserOrderPage,
    apiGetAllCustomer
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", renderUserProfilePage);
router.get("/order", renderUserOrderPage);

// API
router.get('/api/get-all-customers', apiGetAllCustomer)
export default router;
