import express from "express";

import { renderAdminDashboard } from "../controllers/home.controller.js";

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

import { renderAdminCustomerPage } from "../controllers/customer.controller.js";

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
import authRoutes from "./auth.route.js";
import reportRoutes from "./report.route.js";
import sizeRoutes from "./size.route.js";

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

import { searchCustomer } from "../controllers/customer.controller.js";

import multer from "multer";
import {
    verifyManagerRole,
    verifyWarehouseStaffRole,
    verifySalesStaffRole,
    verifyUserLogin,
} from "../middlewares/verifyRoleMiddleware.js";

import { renderAdminSalePage, saleCheckoutRequest } from "../controllers/sale.controller.js";

const uploadFile = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Home admin
router.get("/dashboard", verifyUserLogin, renderAdminDashboard);

// Trang đăng nhập admin
router.use("/auth", authRoutes);

// Goods Receipt [Nhân viên kho]
router.get("/goods-receipt-list", verifyWarehouseStaffRole, renderAdminGoodsReceiptList);
router.get("/goods-receipt-details/:id", verifyWarehouseStaffRole, renderAdminGoodsReceiptDetails);
router.get("/create-goods-receipt", verifyWarehouseStaffRole, renderAdminCreateGoodsReceipt);

// Brand [Nhân viên quản lý]
router.use("/brand", brandRoutes);

// supplier [Nhân viên quản lý]
router.use("/supplier", supplierRoutes);

// category [Nhân viên kho]
router.use("/category", categoryRoutes);
// status [Nhân viên quản lý]
router.use("/status", statusRoutes);

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

// Report [Nhân viên bán hàng + Nhân viên kho]
router.use("/report", reportRoutes);

// Size [Nhân viên kho]
router.use("/size", sizeRoutes);

// Order [Nhân viên bán hàng]
router.get("/order", verifySalesStaffRole, renderAdminOrderPage);
router.get("/order/detail/:id", verifySalesStaffRole, renderAdminOrderDetailPage);
router.post("/order/updateStatus/:id", verifySalesStaffRole, updateOrderStatus);
router.post("/order/nextStatus", verifySalesStaffRole, nextStatusRequest);
router.get("/order/nextStatus/:id", verifySalesStaffRole, nextStatusHandler);
router.post("/order/refundStatus", verifySalesStaffRole, refundStatusRequest);
router.get("/order/refund", verifySalesStaffRole, renderRefundAdminPage);
router.get("/refund/:tabId", verifySalesStaffRole, fetchRefundOrders);
router.get("/order/search/:keyword", verifySalesStaffRole, SearchOrders);

router.get("/profile", verifyUserLogin, renderAdminProfilePage);

// Customer [Nhân viên quản lý]
router.get("/customer", verifySalesStaffRole, renderAdminCustomerPage);
router.get("/customer/search-customer", verifySalesStaffRole, searchCustomer);

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
router.get("/sale", verifySalesStaffRole, renderAdminSalePage);
router.post("/sale/checkout", verifySalesStaffRole, saleCheckoutRequest);

export default router;
