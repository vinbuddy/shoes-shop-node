import express from "express";

import productRoutes from "./product.route.js";
import userRoutes from "./user.route.js";
import authRoutes from "./auth.route.js";
import homeRoutes from "./home.route.js";
import cartRoutes from "./cart.route.js";
import brandRoutes from "./brand.route.js";
import supplierRoutes from "./supplier.route.js";
import adminRoutes from "./admin.route.js";
import checkoutRoutes from "./checkout.route.js";
const router = express.Router();

router.use("/", homeRoutes);
router.use("/user", userRoutes);
router.use("/product", productRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/brand", brandRoutes);
router.use("/supplier", supplierRoutes);
router.use("/admin", adminRoutes);
router.use("/checkout", checkoutRoutes);
export default router;
