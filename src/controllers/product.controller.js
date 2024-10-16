import BrandModel from "../models/hangSanXuat.model.js";
import CategoryModel from "../models/danhMuc.model.js";
import ProductModel from "../models/sanPham.model.js";
import SizeModel from "../models/kichCo.model.js";
import { formatVNCurrency } from "../utils/format.js";
import mongoose from "mongoose";

export async function renderProductPage(req, res) {
    const brands = await BrandModel.find({ trangThaiXoa: false }); // Change this line after merge code
    const categories = await CategoryModel.find({ trangThaiXoa: false });
    const sizes = await SizeModel.find();

    const { page = 1, name, brand, category, size, minPrice, maxPrice } = req.query;
    const pageSize = 10;

    const filters = {
        trangThaiXoa: false,
    };

    if (name && name.trim()) {
        filters.tenSanPham = { $regex: new RegExp(name, "i") };
    }

    if (brand) {
        const brandIds = Array.isArray(brand) ? brand : [brand];
        const brandObjectIds = brandIds.map((id) => new mongoose.Types.ObjectId(id));
        filters.maHangSanXuat = { $in: brandObjectIds };
    }

    if (category) {
        const categoryIds = Array.isArray(category) ? category : [category];
        const categoryObjectIds = categoryIds.map((id) => new mongoose.Types.ObjectId(id));
        console.log("Category IDs: ", categoryObjectIds);
        filters.danhSachDanhMuc = { $in: categoryObjectIds };
    }

    if (size) {
        const sizeIds = Array.isArray(size) ? size : [size];
        const sizeObjectIds = sizeIds.map((id) => new mongoose.Types.ObjectId(id));
        filters["danhSachKichCo.maKichCo"] = { $in: sizeObjectIds };
    }

    if (minPrice || maxPrice) {
        const priceFilters = [];

        // Nếu có minPrice, tìm sản phẩm có giá gốc hoặc giá trong sizes >= minPrice
        if (minPrice) {
            priceFilters.push({
                $or: [
                    { price: { $gte: parseFloat(minPrice) } }, // Giá gốc
                    { "danhSachKichCo.giaKichCo": { $gte: parseFloat(minPrice) } }, // Giá theo size
                ],
            });
        }

        // Nếu có maxPrice, tìm sản phẩm có giá gốc hoặc giá trong sizes <= maxPrice
        if (maxPrice) {
            priceFilters.push({
                $or: [
                    { price: { $lte: parseFloat(maxPrice) } }, // Giá gốc
                    { "danhSachKichCo.giaKichCo": { $lte: parseFloat(maxPrice) } }, // Giá theo size
                ],
            });
        }

        // Áp dụng cả minPrice và maxPrice vào filter
        if (priceFilters.length) {
            filters.$and = priceFilters;
        }
    }

    console.log("Filters: ", filters);

    const products = await ProductModel.find(filters)
        .populate("maHangSanXuat")
        .populate("danhSachDanhMuc")
        .populate("danhSachKichCo.maKichCo")
        .limit(pageSize)
        .skip((page - 1) * pageSize);

    const totalProducts = await ProductModel.countDocuments(filters);
    console.log("totalProducts: ", totalProducts);

    return res.render("product/index", {
        layout: "./layouts/main",
        page: "product",
        title: "Danh sách sản phẩm",
        brands: brands,
        categories: categories,
        sizes: sizes,
        products: products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / pageSize),
        filters: req.query,
        formatCurrency: formatVNCurrency,
    });
}

export async function renderProductDetailPage(req, res) {
    const productId = req.params.id;

    const product = await ProductModel.findOne({ maSanPham: new mongoose.Types.ObjectId(productId) }).populate({
        path: "danhSachKichCo.maKichCo",
    });

    return res.render("product/detail", {
        layout: "./layouts/main",
        page: "product-detail",
        title: "Product detail",
        product: product,
        formatVNCurrency: formatVNCurrency,
    });
}
