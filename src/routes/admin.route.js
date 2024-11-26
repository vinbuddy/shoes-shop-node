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
import authRoutes from "./auth.route.js"
import reportRoutes from "./report.route.js"

import {
    renderAdminOrderPage,
    renderAdminOrderDetailPage,
    updateOrderStatus,
} from "../controllers/order.controller.js";

import {
    renderAdminProfilePage,
} from "../controllers/user.controller.js"

import {
    createPromotionHandler,
    deletePromotionHandler,
    editPromotionHandler,
    renderAdminCreatePromotionPage,
    renderAdminEditPromotionPage,
    renderAdminPromotionPage,
} from "../controllers/promotion.controller.js";

import multer from "multer";

const uploadFile = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/goods-receipt-list', renderAdminGoodsReceiptList);
router.get('/goods-receipt-details/:id', renderAdminGoodsReceiptDetails);
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
router.use("/auth", authRoutes);
router.use("/report", reportRoutes);

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);
router.get("/product/edit/:id", renderAdminEditProductPage);
router.post(
    "/product/edit",
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
router.get("/product/delete/:id", deleteProductHandler);

router.get("/order", renderAdminOrderPage);
router.get("/order/detail/:id", renderAdminOrderDetailPage);
router.post("/order/updateStatus/:id", updateOrderStatus);

router.get("/profile", renderAdminProfilePage)

// Employee
router.get("/employee", renderAdminEmployeePage);
router.get("/employee/create", renderAdminCreateEmployeePage);
router.post(
    "/employee/create",
    uploadFile.fields([
        {
            name: "anhDaiDien",
            maxCount: 1,
        },
    ]),
    createEmployeeHandler
);
router.get("/employee/edit/:id", renderAdminEditEmployeePage);
router.post(
    "/employee/edit",
    uploadFile.fields([
        {
            name: "anhDaiDien",
            maxCount: 1,
        },
    ]),
    editEmployeeHandler
);
router.get("/employee/delete/:id", deleteEmployeeHandler);

// Promotion
router.get("/promotion", renderAdminPromotionPage);
router.get("/promotion/create", renderAdminCreatePromotionPage);
router.post("/promotion/create", createPromotionHandler);
router.get("/promotion/edit/:id", renderAdminEditPromotionPage);
router.post("/promotion/edit", editPromotionHandler);
router.get("/promotion/delete/:id", deletePromotionHandler);

export default router;
