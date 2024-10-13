import BrandModel from "../models/brand.model.js";
import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";
import SizeModel from "../models/size.model.js";
import { formatVNCurrency } from "../utils/format.js";

export async function renderProductPage(req, res) {
    const brands = await BrandModel.find();
    const categories = await CategoryModel.find();
    const sizes = await SizeModel.find();

    const { page = 1, name, brand, category, size } = req.query;
    const pageSize = 10;

    const filters = {
        isDeleted: false,
    };

    if (name && name.trim()) {
        filters.name = { $regex: new RegExp(name, "i") };
    }

    if (brand) {
        const brandArray = brand.split("-");
        filters.brand = { $in: brandArray };
    }

    if (category) {
        const categoryArray = category.split("-");
        filters.categories = categoryArray;
    }

    if (size) {
        const sizeArray = size.split("-");
        filters["sizes.size"] = { $in: sizeArray };
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
