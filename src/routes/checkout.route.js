import express from "express";
import { renderCheckoutPage, calculateShippingFeeHandlerRequest } from "../controllers/checkout.controller.js";

const router = express.Router();

router.get("/", renderCheckoutPage);

router.post("/api/calculate-shipping-fee", calculateShippingFeeHandlerRequest);

export default router;
