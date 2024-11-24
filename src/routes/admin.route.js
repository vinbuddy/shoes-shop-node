import express from "express";
import {
    renderAdminCreateGoodsReceipt,
    renderAdminCreateProductPage,
    renderAdminProductPage,
    createProductHandler,
} from "../controllers/product.controller.js";

import brandRoutes from "./brand.route.js";
import supplierRoutes from "./supplier.route.js";
import categoryRoutes from "./category.route.js";
import statusRoutes from "./status.route.js";
import authRoutes from "./auth.route.js"

import {
    renderAdminOrderPage,
    renderAdminOrderDetailPage,
    updateOrderStatus,
} from "../controllers/order.controller.js";
import multer from "multer";
const uploadFile = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/create-goods-receipt", renderAdminCreateGoodsReceipt);

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);

router.post(
    "/product/create",
    uploadFile.fields([
        {
            name: "productImageFiles",
            maxCount: 30,
        },
        {
            name: "productImageThumbnail",
            maxCount: 1,
        },
    ]),
    createProductHandler
);
router.use("/brand", brandRoutes);
router.use("/supplier", supplierRoutes);
router.use("/category", categoryRoutes);
router.use("/status", statusRoutes);
router.use("/auth", authRoutes)

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);
router.get("/order", renderAdminOrderPage);
router.get("/order/detail/:id", renderAdminOrderDetailPage);
router.post("/order/updateStatus/:id", updateOrderStatus);

export default router;
