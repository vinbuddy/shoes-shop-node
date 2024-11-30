import ProductModel from "../models/sanPham.model.js";

import BrandModel from "../models/hangSanXuat.model.js";
import CategoryModel from "../models/danhMuc.model.js";
import SizeModel from "../models/kichCo.model.js";
import PromotionModel from "../models/chuongTrinhKhuyenMai.model.js";
import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";

import { formatVNCurrency } from "../utils/format.js";
import mongoose from "mongoose";

const VIEW_OPTIONS = {
    SALE: {
        layout: "./layouts/admin",
        title: "Bán hàng",
    },
};

export const renderAdminSalePage = async (req, res) => {
    try {
        const brands = await BrandModel.find({ trangThaiXoa: false });
        const categories = await CategoryModel.find({ trangThaiXoa: false });
        const sizes = await SizeModel.find();

        // Tìm khuyến mãi đang diễn ra
        const promotions = await PromotionModel.find({
            ngayKetThuc: { $gte: new Date() },
            trangThaiXoa: false,
        });

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

        return res.render("admin/sale", {
            ...VIEW_OPTIONS.SALE,
            brands: brands,
            categories: categories,
            sizes: sizes,
            products: products,
            promotions: promotions,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / pageSize),
            filters: req.query,
            formatVNCurrency: formatVNCurrency,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({ message: "Internal server error" });
    }
};

export async function saleCheckoutRequest(req, res) {
    try {
        const { selectedProducts } = req.body;

        const orderDetailItems = selectedProducts.map((item) => {
            return {
                maSanPham: item.productId,
                maKichCoSanPham: item.sizeId,
                soLuongDaChon: Number(item.quantity),
                giaDaChon: Number(item.selectedPrice),
            };
        });

        const totalOrderPrice = orderDetailItems.reduce(
            (total, item) => total + item.soLuongDaChon * item.giaDaChon,
            0
        );

        // Tìm trạng thái hoàn thành
        const status = await TrangThaiModel.find();

        const orderData = {
            maKhachHang: null,
            maNguoiTao: req.session.user.maNguoiDung,
            chiTietDonHang: orderDetailItems,
            thongTinGiaoHang: null,
            thongTinThanhToan: {
                phuongThucThanhToan: "Tiền mặt",
                trangThaiThanhToan: "Hoàn thành",
            },
            tongTienThanhToan: Number(totalOrderPrice),
            trangThaiDonHang: [
                {
                    maTrangThai: status[3].maTrangThai,
                    _id: status[3].maTrangThai,
                    thoiGian: new Date(),
                },
            ],
            ngayDatHang: new Date(),
        };

        const newOrder = await DonHangModel.create(orderData);
        const tempOrder = newOrder;

        await DonHangModel.findByIdAndUpdate(newOrder._id, {
            maDonHang: newOrder._id,
        });

        tempOrder["maDonHang"] = newOrder._id;

        await DonHangModel.findByIdAndUpdate(newOrder._id, {
            maDonHang: newOrder._id,
        });

        // Update product quantity
        await Promise.all(
            tempOrder.chiTietDonHang.map(async (item) => {
                const product = await ProductModel.findOne({ maSanPham: item.maSanPham });
                const sizeIndex = product.danhSachKichCo.findIndex(
                    (size) => size.maKichCo.toString() === item.maKichCoSanPham.toString()
                );

                product.danhSachKichCo[sizeIndex].soLuongKichCo -= item.soLuongDaChon;
                await product.save();
            })
        );

        return res.status(200).json({ message: "Checkout successfully", order: tempOrder });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: error.message });
    }
}
