import express from "express";

import {
    addSize,
    getAllSize,
} from "../controllers/size.controller.js";

const router = express.Router();

router.get("/api/getAllSize", getAllSize);
router.post("/api/add", addSize);

export default router;