import express from "express";

import productRoutes from "./product.route.js";
import userRoutes from "./product.route.js";

const router = express.Router();

router.use("/product", productRoutes);
router.use("/user", userRoutes);

export default router;
