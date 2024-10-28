import express from "express";
import {
    renderAdminCreateProductPage,
    renderAdminProductPage,
    createProductHandler,
} from "../controllers/product.controller.js";
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

router.get("/product", renderAdminProductPage);
router.get("/product/create", renderAdminCreateProductPage);
router.get("/category", renderCategoryPageWithPagination);
router.get("/category/create", renderCreateCategoryPage);
router.get("/category/edit/:id", renderUpdateCategoryPage);
router.get("/category/delete/:id", deleteCategory);
router.get("/category/restore/:id", restoreCategory);
router.post("/category/edit/:id", updateCategory);
router.post("/category/create", createCategory);
router.get("/category/search", searchCategory);

export default router;
