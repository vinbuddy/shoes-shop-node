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
    apiGetGoodsReceipts,
    searchProductRequest,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/api/create-goods-receipt", createGoodsReceipt);
router.get("/api/getAllProduct/", getAllProduct);
router.get("/api/get-goods-receipts/:filterTime", apiGetGoodsReceipts);
router.get("/api/get-product-receipt-by-prod-id/:id", getProductReceiptByProductId);
router.post("/api/update-sizes/:id", updateSizeList);
router.get("/api/product-size/:id", getSizeById);

router.get("/api/search", searchProductRequest);
router.get("/api/:id", getProductById);

router.get("/", renderProductPage);
router.get("/:id", renderProductDetailPage);

export default router;
