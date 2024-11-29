import express from "express";
import {
    renderRevenueReportPage,
    renderExpenditureReportPage,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/revenue-report", renderRevenueReportPage);
router.get("/expenditure-report", renderExpenditureReportPage);
export default router;
