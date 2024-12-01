import express from "express";
import {
    renderProductPage,
    renderProductDetailPage,
    createGoodsReceipt,
    getAllProduct,
    getProductById,
    getSizeById,
    updateSizeList,
    getProductReceiptByProductId,
    searchProductRequest,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", renderProductPage);
router.get("/:id", renderProductDetailPage);

router.get("/api/search", searchProductRequest);

router.post("/api/create-goods-receipt", createGoodsReceipt);
router.get("/api/getAllProduct/", getAllProduct);
router.get("/api/:id", getProductById);
router.get("/api/get-product-receipt-by-prod-id/:id", getProductReceiptByProductId);
router.get("/api/product-size/:id", getSizeById);
router.post("/api/update-sizes/:id", updateSizeList);

export default router;
