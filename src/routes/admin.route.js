import express from "express";
import {
    renderAdminGoodsReceiptDetails,
    renderAdminGoodsReceiptList,
    renderAdminCreateGoodsReceipt,
    renderAdminCreateProductPage,
    renderAdminProductPage,
    createProductHandler,
    renderAdminEditProductPage,
    updateProductHandler,
    deleteProductHandler,
} from "../controllers/product.controller.js";

import {
    createEmployeeHandler,
    deleteEmployeeHandler,
    editEmployeeHandler,
    renderAdminCreateEmployeePage,
    renderAdminEditEmployeePage,
    renderAdminEmployeePage,
} from "../controllers/employee.controller.js";

import brandRoutes from "./brand.route.js";
import supplierRoutes from "./supplier.route.js";
import categoryRoutes from "./category.route.js";
import statusRoutes from "./status.route.js";
import sizeRoutes from "./size.route.js";
import authRoutes from "./auth.route.js";

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

import { renderAdminProfilePage } from "../controllers/user.controller.js";

import {
    createPromotionHandler,
    deletePromotionHandler,
    editPromotionHandler,
    renderAdminCreatePromotionPage,
    renderAdminEditPromotionPage,
    renderAdminPromotionPage,
} from "../controllers/promotion.controller.js";

import multer from "multer";
import {
    verifyManagerRole,
    verifyWarehouseStaffRole,
    // verifySalesStaffRole,
} from "../middlewares/verifyRoleMiddleware.js";

import { renderAdminSalePage, saleCheckoutRequest } from "../controllers/sale.controller.js";

const uploadFile = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Goods Receipt [Nhân viên kho]
router.get("/goods-receipt-list", verifyWarehouseStaffRole, renderAdminGoodsReceiptList);
router.get("/goods-receipt-details/:id", verifyWarehouseStaffRole, renderAdminGoodsReceiptDetails);
router.get("/create-goods-receipt", verifyWarehouseStaffRole, renderAdminCreateGoodsReceipt);

router.use("/brand", brandRoutes);
router.use("/supplier", supplierRoutes);
router.use("/category", categoryRoutes);
router.use("/status", statusRoutes);
router.use("/auth", authRoutes);

// Product [Nhân viên kho]
router.get("/product", verifyWarehouseStaffRole, renderAdminProductPage);
router.get("/product/create", verifyWarehouseStaffRole, renderAdminCreateProductPage);
router.get("/product/edit/:id", verifyWarehouseStaffRole, renderAdminEditProductPage);
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
router.use("/size", sizeRoutes);
router.use("/auth", authRoutes);

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);
router.get("/product/edit/:id", renderAdminEditProductPage);
router.post(
    "/product/edit",
    verifyWarehouseStaffRole,
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
    updateProductHandler
);
router.get("/product/delete/:id", verifyWarehouseStaffRole, deleteProductHandler);

// Order [Nhân viên bán hàng]
router.get("/order", renderAdminOrderPage);

router.get("/order/detail/:id", renderAdminOrderDetailPage);
router.post("/order/updateStatus/:id", updateOrderStatus);
router.post("/order/nextStatus", nextStatusRequest);
router.get("/order/nextStatus/:id", nextStatusHandler);
router.post("/order/refundStatus", refundStatusRequest);
router.get("/order/refund", renderRefundAdminPage);
router.get("/refund/:tabId", fetchRefundOrders);
router.get("/order/search/:keyword", SearchOrders);

router.get("/profile", renderAdminProfilePage);

// Employee [Nhân viên quản lý]
router.get("/employee", verifyManagerRole, renderAdminEmployeePage);
router.get("/employee/create", verifyManagerRole, renderAdminCreateEmployeePage);
router.post(
    "/employee/create",
    verifyManagerRole,
    uploadFile.fields([
        {
            name: "anhDaiDien",
            maxCount: 1,
        },
    ]),
    createEmployeeHandler
);
router.get("/employee/edit/:id", verifyManagerRole, renderAdminEditEmployeePage);
router.post(
    "/employee/edit",
    verifyManagerRole,
    uploadFile.fields([
        {
            name: "anhDaiDien",
            maxCount: 1,
        },
    ]),
    editEmployeeHandler
);
router.get("/employee/delete/:id", verifyManagerRole, deleteEmployeeHandler);

// Promotion [Nhân viên quản lý]
router.get("/promotion", verifyManagerRole, renderAdminPromotionPage);
router.get("/promotion/create", verifyManagerRole, renderAdminCreatePromotionPage);
router.post("/promotion/create", verifyManagerRole, createPromotionHandler);
router.get("/promotion/edit/:id", verifyManagerRole, renderAdminEditPromotionPage);
router.post("/promotion/edit", verifyManagerRole, editPromotionHandler);
router.get("/promotion/delete/:id", verifyManagerRole, deletePromotionHandler);

// Sale [Nhân viên bán hàng]
router.get("/sale", renderAdminSalePage);
router.post("/sale/checkout", saleCheckoutRequest);

export default router;
