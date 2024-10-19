import express from "express";
import {
    renderAdminCreateProductPage,
    renderAdminProductPage,
    createProductHandler,
} from "../controllers/product.controller.js";
import multer from "multer";
const uploadFile = multer({ storage: multer.memoryStorage() });

const router = express.Router();

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

export default router;
