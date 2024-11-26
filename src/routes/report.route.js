import express from "express";
import {
    renderRevenueReportPage,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/revenue-report", renderRevenueReportPage);
export default router;
