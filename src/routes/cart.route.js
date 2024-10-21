import express from "express";
import {
    renderCartPage,
    getTotalCartItemsRequest,
    addToCartHandlerRequest,
    deleteCartItemHandlerRequest,
    updateCartItemQuantityHandlerRequest,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", renderCartPage);

router.get("/api/total", getTotalCartItemsRequest);
router.post("/api/add", addToCartHandlerRequest);
router.delete("/api/delete/:productId", deleteCartItemHandlerRequest);
router.put("/api/update-quantity", updateCartItemQuantityHandlerRequest);

export default router;
