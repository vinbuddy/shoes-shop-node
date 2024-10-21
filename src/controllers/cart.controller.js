import mongoose from "mongoose";

import GioHangModel from "../models/gioHang.model.js";
import SanPhamModel from "../models/sanPham.model.js";
import KichCoModel from "../models/kichCo.model.js";
import { formatVNCurrency } from "../utils/format.js";

const VIEW_OPTIONS = {
    CART_LIST: {
        layout: "./layouts/main",
        title: "Giỏ hàng của bạn",
    },
};

export async function renderCartPage(req, res) {
    const customer = req.session.customer;

    if (!customer || !customer.maKhachHang) {
        return res.redirect("/auth/login");
    }

    const { maKhachHang } = customer;

    // Get the customer's cart
    const cart = await GioHangModel.findOne({
        maKhachHang: new mongoose.Types.ObjectId(maKhachHang),
    })
        .populate("maKhachHang")
        .populate("danhSachSanPham.maSanPham")
        .populate("danhSachSanPham.maKichCoSanPham");

    console.log("cart: ", cart);

    if (!cart) {
        return res.render("cart/index", {
            ...VIEW_OPTIONS.CART_LIST,
            cart: null,
            formatVNCurrency: formatVNCurrency,
        });
    }

    return res.render("cart/index", {
        ...VIEW_OPTIONS.CART_LIST,
        cart: cart,
        formatVNCurrency: formatVNCurrency,
    });
}

export async function getTotalCartItemsRequest(req, res) {
    try {
        const customer = req.session.customer;

        if (!customer || !customer.maKhachHang) {
            return res.status(401).json({ message: "User is not authenticated." });
        }

        const { maKhachHang } = customer;

        const cart = await GioHangModel.findOne({ maKhachHang: new mongoose.Types.ObjectId(maKhachHang) });

        if (!cart) {
            return res.json({ totalItems: 0 });
        }

        return res.json({ totalItems: cart.danhSachSanPham.length });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function addToCartHandlerRequest(req, res) {
    try {
        const { maKhachHang: userId } = req.session.customer;

        const { productId, sizeId, quantity, selectedPrice } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "User is not authenticated." });
        }

        const product = await SanPhamModel.findOne({ maSanPham: new mongoose.Types.ObjectId(productId) });
        const size = await KichCoModel.findOne({ maKichCo: new mongoose.Types.ObjectId(sizeId) });

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        if (!size) {
            return res.status(404).json({ message: "Size not found." });
        }

        // Find the customer's cart
        let cart = await GioHangModel.findOne({ maKhachHang: userId });

        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = new GioHangModel({
                maKhachHang: userId,
                danhSachSanPham: [],
                tongTien: 0,
            });
        }

        // Check if the product with the specific size is already in the cart
        const existingProductIndex = cart.danhSachSanPham.findIndex(
            (item) => item.maSanPham.equals(productId) && item.maKichCoSanPham.equals(sizeId)
        );

        if (existingProductIndex >= 0) {
            // Update the existing product's quantity and price
            cart.danhSachSanPham[existingProductIndex].soLuongSanPham += quantity;
            cart.danhSachSanPham[existingProductIndex].giaSanPham = selectedPrice;
        } else {
            // Add the new product to the cart
            cart.danhSachSanPham.push({
                maSanPham: productId,
                maKichCoSanPham: sizeId,
                soLuongSanPham: quantity,
                giaSanPham: selectedPrice, // Assuming you store the price on the product
            });
        }

        // Recalculate the total price of the cart
        cart.tongTien = cart.danhSachSanPham.reduce((total, item) => {
            return total + item.soLuongSanPham * item.giaSanPham;
        }, 0);

        // Save the updated cart
        await cart.save();

        // Update maGioHang
        await GioHangModel.updateOne(
            { _id: cart._id },
            {
                $set: {
                    maGioHang: cart._id,
                },
            }
        );

        return res.status(200).json({ message: "Product added to cart successfully", cart });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
