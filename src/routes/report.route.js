import express from "express";
import { renderRevenueReportPage, renderExpenditureReportPage } from "../controllers/report.controller.js";
import { verifyWarehouseStaffRole, verifySalesStaffRole } from "../middlewares/verifyRoleMiddleware.js";

const router = express.Router();

router.get("/revenue-report", verifySalesStaffRole, renderRevenueReportPage);
router.get("/expenditure-report", verifyWarehouseStaffRole, renderExpenditureReportPage);
export default router;
