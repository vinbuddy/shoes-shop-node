import express from "express";
import { renderCheckoutPage } from "../controllers/checkout.controller.js";

const router = express.Router();

router.get("/", renderCheckoutPage);

export default router;
