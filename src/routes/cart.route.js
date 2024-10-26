import express from "express";
import {
    renderCartPage,
    getTotalCartItemsRequest,
    addToCartHandlerRequest,
    deleteCartItemHandlerRequest,
    updateCartItemQuantityHandlerRequest,
    setSelectedItemsHandlerRequest,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", renderCartPage);

router.get("/api/total", getTotalCartItemsRequest);
router.post("/api/add", addToCartHandlerRequest);
router.delete("/api/delete/:productId", deleteCartItemHandlerRequest);
router.put("/api/update-quantity", updateCartItemQuantityHandlerRequest);
router.post("/api/set-selected-items", setSelectedItemsHandlerRequest);
export default router;
