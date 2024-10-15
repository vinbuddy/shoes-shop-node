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
} from "../controllers/supplier.controller.js";

const router = express.Router();

router.get("/", renderSupplierPageWithPagination);
router.get("/create", renderCreatePage);
router.get("/edit/:id", renderUpdatePage);
router.get("/delete/:id", deleteSupplier);
router.get("/restore/:id", restoreSupplier);
router.post("/edit/:id", updateSupplier);
router.post("/create", createSupplier);
router.get("/search", searchSupplier);
export default router;
