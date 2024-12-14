import express from "express";
import {
    renderSizePageWithPagination,
    deleteSize,
    updateSize,
    renderCreatePage,
    createSize,
    restoreSize,
    searchSize,
    addSize,
    getAllSize,
} from "../controllers/size.controller.js";
import { verifyWarehouseStaffRole } from "../middlewares/verifyRoleMiddleware.js";

const router = express.Router();

router.get("/", verifyWarehouseStaffRole, renderSizePageWithPagination);
router.get("/create", verifyWarehouseStaffRole, renderCreatePage);
router.get("/delete/:id", verifyWarehouseStaffRole, deleteSize);
router.get("/restore/:id", verifyWarehouseStaffRole, restoreSize);
router.post("/edit", verifyWarehouseStaffRole, updateSize);
router.post("/create", verifyWarehouseStaffRole, createSize);
router.get("/search", verifyWarehouseStaffRole, searchSize);
router.get("/api/getAllSize", verifyWarehouseStaffRole, getAllSize);
router.post("/api/add", verifyWarehouseStaffRole, addSize);

export default router;
