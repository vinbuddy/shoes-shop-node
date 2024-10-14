import express from "express";
import {
    renderBrandPage,
    deleteBrand,
    updateBrand,
    renderCreatePage,
    createBrand,
    restoreBrand,
} from "../controllers/brand.controller.js";

const router = express.Router();

router.get("/", renderBrandPage);
router.get("/create", renderCreatePage);
router.get("/delete/:id", deleteBrand);
router.get("/restore/:id", restoreBrand);
router.post("/edit", updateBrand);
router.post("/create", createBrand);
export default router;
