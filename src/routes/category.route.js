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
const router = express.Router();

router.get("/", renderCategoryPageWithPagination);
router.get("/create", renderCreateCategoryPage);
router.get("/edit/:id", renderUpdateCategoryPage);
router.get("/delete/:id", deleteCategory);
router.get("/restore/:id", restoreCategory);
router.post("/edit/:id", updateCategory);
router.post("/create", createCategory);
router.get("/search", searchCategory);
export default router;
