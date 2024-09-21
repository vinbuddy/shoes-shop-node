import express from "express";
import { renderProductPage, renderProductDetailPage } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", renderProductPage);
router.get("/:id", renderProductDetailPage);

export default router;
