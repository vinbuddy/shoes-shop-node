import express from "express";

import productRoutes from "./product.route.js";
import userRoutes from "./product.route.js";
import authRoutes from "./auth.route.js";
import homeRoutes from "./home.route.js";
import cartRoutes from "./cart.route.js";

const router = express.Router();

router.use("/", homeRoutes);
router.use("/product", productRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);

export default router;
