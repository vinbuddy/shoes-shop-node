import BrandModel from "../models/hangSanXuat.model.js";
import CategoryModel from "../models/danhMuc.model.js";
import ProductModel from "../models/sanPham.model.js";
import SupplierModel from "../models/nhaCungCap.model.js";
import GoodsReceiptModel from "../models/phieuNhap.js"
import SizeModel from "../models/kichCo.model.js";
import { formatVNCurrency } from "../utils/format.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import env from "dotenv";
import PhieuNhapModel from "../models/phieuNhap.js";
import SanPhamModel from "../models/sanPham.model.js";

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

    return res.render("product/detail", {
        ...VIEW_OPTIONS.PRODUCT_DETAIL,
        loginUrl: req?.session?.customer ? null : process.env.BASE_URL + "/auth/login",
        product: product,
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

export async function renderAdminCreateGoodsReceipt (req, res, next) {
    try {
        const user = req.session.user;
        const suppliers = await SupplierModel.find({}).select();
        const products = await ProductModel.find({}).select();
        const data = {
            'suppliers' : suppliers,
            'products': products,
        }
        return res.render("admin/product/goods-receipt", {
            layout: "./layouts/admin",
            page: "goods-receipt",
            title: "Phiếu nhập hàng",
            data: data,
            user: user,
        });
    } catch (error) {
        next(error);
    }
}

export async function renderAdminGoodsReceiptList(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 10;
        const skip = (page - 1) * itemsPerPage;
        
        // Lọc theo ngày nhập
        const filterDateString = req.query.filterDate || '';
        // Lọc theo tên sản phẩm
        const productName = req.query.productName || '';
        let filterDate;

        let filter = {};

        if (filterDateString) {
            filterDate = new Date(filterDateString + "T00:00:00");
            if (!isNaN(filterDate.getTime())) {
                if (filterDate) {
                    const startOfDay  = new Date(filterDate);
                    startOfDay.setHours(0, 0, 0, 0);
        
                    const endOfDay = new Date(filterDate);
                    endOfDay.setHours(23, 59, 59, 999);
        
                    filter.ngayNhap = { 
                        $gte: startOfDay,
                        $lt: endOfDay // Nhỏ hơn nửa đêm của ngày kế tiếp (23:59:59)
                    };
                }
            }
            else {
                console.error("Định dạng ngày không hợp lệ");
            }
        }

        const user = req.session.user;
        const product = await SanPhamModel.findOne({tenSanPham : productName});
        if (product) {
            filter = {
                productId: {'chiTiet.maSanPham': product.id}
            }
        }

        const phieuNhap = await PhieuNhapModel.find(filter)
                        .skip(skip)
                        .limit(itemsPerPage)
                        .populate("nhaCungCap")
                        .populate("chiTiet.maSanPham")
                        .exec();
        
        const formattedPhieuNhap = phieuNhap.map(item => {
            const date = new Date(item.ngayNhap);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            return { ...item._doc, ngayNhap: formattedDate };
        });
        // console.log(formattedPhieuNhap);

        return res.render("admin/product/goods-receipt-list", {
            layout: "./layouts/admin",
            page: "goods-receipt-list",
            title: "Danh sách phiếu nhập hàng",
            goodsReceipt: formattedPhieuNhap,
            user: user,
            filterDate: filterDateString,
            productName,
        });
    } catch (error) {
        next(error);
    }
    
}
export async function renderAdminGoodsReceiptDetails(req, res, next) {
    try {
        const user = req.session.user;
        const { id } = req.params;

        const details = await PhieuNhapModel.findOne({maPhieuNhap: id})
                        .populate("nhaCungCap")
                        .populate("chiTiet.maSanPham")
                        .populate("chiTiet.danhSachKichCo.maKichCo")
                        .exec();

        const date = new Date(details.ngayNhap);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        

        console.log(details);

        return res.render("admin/product/goods-receipt-details", {
            layout: "./layouts/admin",
            page: "goods-receipt-details",
            title: "Chi tiết phiếu nhập hàng",
            details,
            user: user,
            dateReceipt: formattedDate,
        });
    } catch (error) {
        next(error);
    }
    
}

// API

// Get Product Information
// [GET] /api/product/
export async function getAllProduct(req, res) {

    const product = await ProductModel.find({}).select();

    if (product) {
        return res.json(product);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
}
export async function getProductById(req, res) {
    const productId = req.params.id;
    
    const product = await ProductModel.findOne({ maSanPham: productId }).sort({maSanPham: 1});
    if (product) {
        return res.json(product);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
}
// Get Product Size By Id
// [GET] /api/product-size/:id
export async function getSizeById(req, res) {
    const sizeId = req.params.id;

    const size = await SizeModel.findOne({maKichCo : sizeId}).sort({maKichCo: 1});
    
    if (size) {
        return res.json(size);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy kích cỡ này' });
    }
}
// Create Goods Receipt 
// [POST] /api/product/create-goods-receipt
export async function createGoodsReceipt(req, res) {
    const { nhaCungCap, chiTiet } = req.body;

    if (!nhaCungCap || !chiTiet || !Array.isArray(chiTiet)) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    try {
        const phieuNhap = new GoodsReceiptModel({
            nhaCungCap: nhaCungCap,
            chiTiet: chiTiet,
        });
        
        for (const item of chiTiet) {
            let prod = await ProductModel.findOne({maSanPham: item.maSanPham});
            
            if (prod) {
                const updatedSizes = prod.danhSachKichCo.map((prodSize) => {
                    const receiptSize = item.danhSachKichCo.find((size) => size.maKichCo == prodSize.maKichCo);
                    if (receiptSize) {
                        prodSize.soLuongKichCo += receiptSize.soLuongKichCo;
                    }
                    return prodSize;
                });

                await ProductModel.updateOne({maSanPham: item.maSanPham}, {danhSachKichCo: updatedSizes})
                console.log(`Cập nhật số lượng sản phẩm: ${prod.tenSanPham} thành công.`);
            }
            else {
                console.log(`Không tìm thấy sản phẩm với mã: ${item.maSanPham}`);
            }
        }
        
        await phieuNhap.save();
        return res.status(200).json({ redirectUrl: "/admin/create-goods-receipt" });
    }
    catch (error) {
        console.error('Lỗi khi lưu phiếu nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
}

export async function updateSizeList(req, res) {
    const { productId, danhSachKichCo } = req.body;

    console.log(productId)
    
    if (!Array.isArray(danhSachKichCo)) {
        return res.status(400).json({ message: 'Dữ liệu danh sách kích cỡ không hợp lệ.' });
    }

    try {
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
        }

        // Kiểm tra các mã size có hợp lệ
        for (const kichCo of danhSachKichCo) {
            const isValidSize = await SizeModel.findById(kichCo.maKichCo);
            if (!isValidSize) {
                return res.status(400).json({
                    message: `Mã kích cỡ không hợp lệ: ${kichCo.maKichCo}`,
                });
            }
        }

        // Cập nhật danh sách size
        product.danhSachKichCo = danhSachKichCo;
        await product.save();

        return res.status(200).json({ message: 'Cập nhật danh sách kích cỡ thành công.', product });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại sau.', error });
    }
}
// Get Product Information
// [GET] /api/product/
export async function getProductReceiptByProductId(req, res) {
    const productId = req.params.id;
    const product = await PhieuNhapModel.find({'chiTiet.maSanPham': productId})
                        .populate("chiTiet.maSanPham")
                        .populate("chiTiet.danhSachKichCo.maKichCo")
                        .exec();

    if (product) {
        return res.json(product);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
}