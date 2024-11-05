import express from "express";
import {renderCreateGoodsReceipt} from "../controllers/admin/product.controller.js";

const router = express.Router();

router.get("/create-goods-receipt", renderCreateGoodsReceipt);

export default router;
