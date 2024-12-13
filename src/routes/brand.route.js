import express from "express";
import {
    renderBrandPageWithPagination,
    deleteBrand,
    updateBrand,
    renderCreatePage,
    createBrand,
    restoreBrand,
    searchBrand,
} from "../controllers/brand.controller.js";
import { verifyManagerRole } from "../middlewares/verifyRoleMiddleware.js";

const router = express.Router();

router.get("/", verifyManagerRole, renderBrandPageWithPagination);
router.get("/create", verifyManagerRole, renderCreatePage);
router.get("/delete/:id", verifyManagerRole, deleteBrand);
router.get("/restore/:id", verifyManagerRole, restoreBrand);
router.post("/edit", verifyManagerRole, updateBrand);
router.post("/create", verifyManagerRole, createBrand);
router.get("/search", verifyManagerRole, searchBrand);
export default router;
