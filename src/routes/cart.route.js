import express from "express";
import { renderCartPage, getTotalCartItemsRequest, addToCartHandlerRequest } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", renderCartPage);

router.get("/api/total", getTotalCartItemsRequest);
router.post("/api/add", addToCartHandlerRequest);

export default router;
