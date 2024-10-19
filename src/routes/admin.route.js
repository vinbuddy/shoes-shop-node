import express from "express";
import { renderAdminCreateProductPage, renderAdminProductPage } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);

export default router;
