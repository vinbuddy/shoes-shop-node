import express from "express";
import {
    renderCategoryPageWithPagination,
    deleteCategory,
    updateCategory,
    renderCreateCategoryPage,
    createCategory,
    renderUpdateCategoryPage,
    restoreCategory,
    searchCategory,
} from "../controllers/category.controller.js";
import { verifyWarehouseStaffRole } from "../middlewares/verifyRoleMiddleware.js";

const router = express.Router();

router.get("/", verifyWarehouseStaffRole, renderCategoryPageWithPagination);
router.get("/create", verifyWarehouseStaffRole, renderCreateCategoryPage);
router.get("/edit/:id", verifyWarehouseStaffRole, renderUpdateCategoryPage);
router.get("/delete/:id", verifyWarehouseStaffRole, deleteCategory);
router.get("/restore/:id", verifyWarehouseStaffRole, restoreCategory);
router.post("/edit/:id", verifyWarehouseStaffRole, updateCategory);
router.post("/create", verifyWarehouseStaffRole, createCategory);
router.get("/search", verifyWarehouseStaffRole, searchCategory);
export default router;
