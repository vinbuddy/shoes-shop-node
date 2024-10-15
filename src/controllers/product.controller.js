import mongoose from "mongoose";
import BrandModel from "../models/brand.model.js";
import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";
import SizeModel from "../models/size.model.js";
import { formatVNCurrency } from "../utils/format.js";

export async function renderProductPage(req, res) {
    const brands = await BrandModel.find(); // Change this line after merge code
    const categories = await CategoryModel.find({ isDeleted: false });
    const sizes = await SizeModel.find();

    const { page = 1, name, brand, category, size, minPrice, maxPrice } = req.query;
    const pageSize = 10;

    const filters = {
        isDeleted: false,
    };

    if (name && name.trim()) {
        filters.name = { $regex: new RegExp(name, "i") };
    }

    if (brand) {
        const brandIds = Array.isArray(brand) ? brand : [brand];
        const brandObjectIds = brandIds.map((id) => new mongoose.Types.ObjectId(id));
        filters.brand = { $in: brandObjectIds };
    }

    if (category) {
        const categoryIds = Array.isArray(category) ? category : [category];
        const categoryObjectIds = categoryIds.map((id) => new mongoose.Types.ObjectId(id));
        filters.categories = { $in: categoryObjectIds };
    }

    if (size) {
        const sizeIds = Array.isArray(size) ? size : [size];
        const sizeObjectIds = sizeIds.map((id) => new mongoose.Types.ObjectId(id));
        filters["sizes.size"] = { $in: sizeObjectIds };
    }

    if (minPrice || maxPrice) {
        const priceFilters = [];

        // Nếu có minPrice, tìm sản phẩm có giá gốc hoặc giá trong sizes >= minPrice
        if (minPrice) {
            priceFilters.push({
                $or: [
                    { price: { $gte: parseFloat(minPrice) } }, // Giá gốc
                    { "sizes.price": { $gte: parseFloat(minPrice) } }, // Giá theo size
                ],
            });
        }

        // Nếu có maxPrice, tìm sản phẩm có giá gốc hoặc giá trong sizes <= maxPrice
        if (maxPrice) {
            priceFilters.push({
                $or: [
                    { price: { $lte: parseFloat(maxPrice) } }, // Giá gốc
                    { "sizes.price": { $lte: parseFloat(maxPrice) } }, // Giá theo size
                ],
            });
        }

        // Áp dụng cả minPrice và maxPrice vào filter
        if (priceFilters.length) {
            filters.$and = priceFilters;
        }
    }

    const products = await ProductModel.find(filters)
        .populate("brand")
        .populate("categories")
        .populate("sizes.size")
        .limit(pageSize)
        .skip((page - 1) * pageSize);

    const totalProducts = await ProductModel.countDocuments(filters);

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

export function renderProductDetailPage(req, res) {
    // get product id from request params

    // const productId = req.params.id;

    const product = {};

    return res.render("product/detail", {
        layout: "./layouts/main",
        page: "product-detail",
        title: "Product detail",
        product: product,
    });
}
