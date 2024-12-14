import express from "express";
import {
    renderSupplierPageWithPagination,
    deleteSupplier,
    updateSupplier,
    renderCreatePage,
    createSupplier,
    renderUpdatePage,
    restoreSupplier,
    searchSupplier,
    getSupplierById,
} from "../controllers/supplier.controller.js";

import { verifyManagerRole } from "../middlewares/verifyRoleMiddleware.js";

const router = express.Router();

router.get("/", verifyManagerRole, renderSupplierPageWithPagination);
router.get("/create", verifyManagerRole, renderCreatePage);
router.get("/edit/:id", verifyManagerRole, renderUpdatePage);
router.get("/delete/:id", verifyManagerRole, deleteSupplier);
router.get("/restore/:id", verifyManagerRole, restoreSupplier);
router.post("/edit/:id", verifyManagerRole, updateSupplier);
router.post("/create", verifyManagerRole, createSupplier);
router.get("/search", verifyManagerRole, searchSupplier);

router.get("/api/:id", verifyManagerRole, getSupplierById);
export default router;
