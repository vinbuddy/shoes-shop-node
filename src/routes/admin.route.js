import express from "express";
import {
    renderAdminCreateProductPage,
    renderAdminProductPage,
    createProductHandler,
} from "../controllers/product.controller.js";

import brandRoutes from "./brand.route.js";
import supplierRoutes from "./supplier.route.js";
import categoryRoutes from "./category.route.js";
import statusRoutes from "./status.route.js";
import {
    renderAdminOrderPage,
    renderAdminOrderDetailPage,
    updateOrderStatus,
    nextStatusRequest,
    renderRefundAdminPage,
    fetchRefundOrders,
    refundStatusRequest,
    nextStatusHandler,
    SearchOrders,
} from "../controllers/order.controller.js";
import multer from "multer";
const uploadFile = multer({ storage: multer.memoryStorage() });

const router = express.Router();
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

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);
router.get("/order", renderAdminOrderPage);

router.get("/order/detail/:id", renderAdminOrderDetailPage);
router.post("/order/updateStatus/:id", updateOrderStatus);
router.post("/order/nextStatus", nextStatusRequest);
router.get("/order/nextStatus/:id", nextStatusHandler);
router.post("/order/refundStatus", refundStatusRequest);
router.get("/order/refund", renderRefundAdminPage);
router.get("/refund/:tabId", fetchRefundOrders);
router.get("/order/search/:keyword", SearchOrders);
export default router;
