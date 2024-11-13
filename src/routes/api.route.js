import express from "express";
import * as ProductAPI from "../controllers/api/product.controller.js";
import * as SupplierAPI from "../controllers/api/supplier.controller.js";

const router = express.Router();

router.post("/product/create-goods-receipt", ProductAPI.createGoodsReceipt);

router.get("/product/", ProductAPI.getAllProduct);
router.get("/product/:id", ProductAPI.getProductById);
router.get("/product-size/:id", ProductAPI.getSizeById);

router.get("/supplier/:id", SupplierAPI.getSupplierById);



export default router;