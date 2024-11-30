import BrandModel from "../models/hangSanXuat.model.js";
import CategoryModel from "../models/danhMuc.model.js";
import ProductModel from "../models/sanPham.model.js";
import SizeModel from "../models/kichCo.model.js";
import { formatVNCurrency } from "../utils/format.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import env from "dotenv";
import DanhGiaModel from "../models/danhGia.model.js";

env.config();

const VIEW_OPTIONS = {
    ADMIN_CREATE: {
        layout: "./layouts/admin",
        title: "Thêm sản phẩm",
    },
    ADMIN_LIST: {
        layout: "./layouts/admin",
        title: "Danh sách sản phẩm",
    },
    PRODUCT_DETAIL: {
        layout: "./layouts/main",
        title: "Product detail",
    },
    PRODUCT_LIST: {
        layout: "./layouts/main",
        title: "Danh sách sản phẩm",
    },
};

export async function renderProductPage(req, res) {
    const brands = await BrandModel.find({ trangThaiXoa: false });
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

    const products = await ProductModel.find(filters)
        .populate("maHangSanXuat")
        .populate("danhSachDanhMuc")
        .populate("danhSachKichCo.maKichCo")
        .limit(pageSize)
        .skip((page - 1) * pageSize);

    const totalProducts = await ProductModel.countDocuments(filters);

    return res.render("product/index", {
        ...VIEW_OPTIONS.PRODUCT_LIST,
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

    const product = await ProductModel.findOne({ maSanPham: new mongoose.Types.ObjectId(productId) })
        .populate({
            path: "danhSachKichCo.maKichCo",
        })
        .populate("danhSachDanhMuc");
    const reviews = await DanhGiaModel.find({ maSanPham: new mongoose.Types.ObjectId(productId) })
        .populate("maKhachHang")
        .exec();

    const totalRating = reviews.reduce((total, review) => total + review.soDiem, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    const dataReview = {
        reviews: reviews,
        averageRating: averageRating,
    };
    return res.render("product/detail", {
        ...VIEW_OPTIONS.PRODUCT_DETAIL,
        loginUrl: req?.session?.customer ? null : process.env.BASE_URL + "/auth/login",
        product: product,
        dataReview: dataReview,
        formatVNCurrency: formatVNCurrency,
    });
}

// ADMIN PAGE
export async function renderAdminProductPage(req, res) {
    const { page = 1 } = req.query;
    const pageSize = 10;

    const products = await ProductModel.find({ trangThaiXoa: false })
        .populate("maHangSanXuat")
        .populate("danhSachDanhMuc")
        .limit(pageSize)
        .skip((page - 1) * pageSize);

    const totalProducts = await ProductModel.countDocuments({ trangThaiXoa: false });

    return res.render("admin/product/index", {
        ...VIEW_OPTIONS.ADMIN_LIST,
        products: products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / pageSize),
        filters: req.query,
    });
}

export async function renderAdminCreateProductPage(req, res) {
    const brands = await BrandModel.find({ trangThaiXoa: false });
    const categories = await CategoryModel.find({ trangThaiXoa: false });
    const sizes = await SizeModel.find();

    return res.render("admin/product/create", {
        ...VIEW_OPTIONS.ADMIN_CREATE,
        brands: brands,
        categories: categories,
        sizes: sizes,
    });
}

export async function createProductHandler(req, res) {
    try {
        const { name, brand, category, description, sizes } = req.body;

        // Check duplicate product name
        const existingProduct = await ProductModel.findOne({ tenSanPham: name });

        if (existingProduct) {
            throw new Error("Tên sản phẩm đã tồn tại");
        }

        const files = req.files;

        const productImageFiles = files["productImageFiles"];
        const thumbnailImageFile = files["productImageThumbnail"];
        let uploadedFiles = [];
        let thumbnailUrl = null;
        if (productImageFiles && productImageFiles.length > 0) {
            const uploadPromises = productImageFiles.map((file) => {
                let uploadPromise = uploadToCloudinary(file, "products");
                return uploadPromise;
            });
            uploadedFiles = await Promise.all(uploadPromises);
        }

        if (thumbnailImageFile && thumbnailImageFile.length > 0) {
            const thumbnailUpload = await uploadToCloudinary(thumbnailImageFile[0], "thumbnails");
            thumbnailUrl = thumbnailUpload.url;
        }

        const categoryIds = Array.isArray(category) ? category : [category];
        const categoryObjectIds = categoryIds.map((id) => new mongoose.Types.ObjectId(id));

        const brandObjectId = new mongoose.Types.ObjectId(brand);

        // Sử dụng Object.entries để chuyển object thành mảng các cặp key-value
        const productSizes = Object.entries(sizes).map(([maKichCo, kichCo]) => {
            if (!maKichCo || !kichCo.maKichCo || !kichCo.giaKichCo) {
                return null; // Bỏ qua nếu thiếu maKichCo hoặc giaKichCo
            }
            return {
                maKichCo: new mongoose.Types.ObjectId(maKichCo),
                soLuongKichCo: 0,
                giaKichCo: Number(kichCo.giaKichCo),
            };
        });

        const product = new ProductModel({
            tenSanPham: name,
            maHangSanXuat: brandObjectId,
            danhSachDanhMuc: categoryObjectIds,
            moTaSanPham: description,
            danhSachHinhAnh: uploadedFiles.map((file) => file.url),
            hinhAnhDaiDien: thumbnailUrl,
            danhSachKichCo: productSizes.filter((size) => size !== null) || [],
        });

        await product.save();

        await ProductModel.updateOne(
            { _id: product._id },
            {
                $set: {
                    maSanPham: product._id,
                },
            }
        );

        return res.redirect("/admin/product");
    } catch (error) {
        const brands = await BrandModel.find({ trangThaiXoa: false });
        const categories = await CategoryModel.find({ trangThaiXoa: false });
        const sizes = await SizeModel.find();

        return res.render("admin/product/create", {
            ...VIEW_OPTIONS.ADMIN_CREATE,
            brands: brands,
            categories: categories,
            sizes: sizes,
            error: error.message,
        });
    }
}
