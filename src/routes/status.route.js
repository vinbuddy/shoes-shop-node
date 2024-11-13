import express from "express";
import {
    renderStatusPageWithPagination,
    deleteStatus,
    updateStatus,
    createStatus,
    restoreStatus,
    searchStatus,
} from "../controllers/status.controller.js";

const router = express.Router();

router.get("/", renderStatusPageWithPagination);
router.get("/delete/:id", deleteStatus);
router.get("/restore/:id", restoreStatus);
router.post("/edit", updateStatus);
router.post("/create", createStatus);
router.get("/search", searchStatus);
export default router;
