import express from "express";
import {
    renderSizePageWithPagination,
    deleteSize,
    updateSize,
    renderCreatePage,
    createSize,
    restoreSize,
    searchSize,
} from "../controllers/size.controller.js";

const router = express.Router();

router.get("/", renderSizePageWithPagination);
router.get("/create", renderCreatePage);
router.get("/delete/:id", deleteSize);
router.get("/restore/:id", restoreSize);
router.post("/edit", updateSize);
router.post("/create", createSize);
router.get("/search", searchSize);
export default router;
