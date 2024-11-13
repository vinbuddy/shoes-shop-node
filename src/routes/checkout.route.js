import express from "express";
import {
    renderCheckoutPage,
    calculateShippingFeeHandlerRequest,
    checkoutHandler,
    renderCheckoutResultPage,
} from "../controllers/checkout.controller.js";

const router = express.Router();

router.get("/", renderCheckoutPage);
router.get("/result", renderCheckoutResultPage);

router.post("/api/calculate-shipping-fee", calculateShippingFeeHandlerRequest);
router.post("/", checkoutHandler);

export default router;
