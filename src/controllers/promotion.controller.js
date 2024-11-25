import mongoose from "mongoose";
import PromotionModel from "../models/chuongTrinhKhuyenMai.model.js";
import ProductModel from "../models/sanPham.model.js";

const VIEW_OPTIONS = {
    PROMOTION_LIST: {
        title: "Danh sách khuyến mãi",
        layout: "./layouts/admin",
    },
    PROMOTION_CREATE: {
        title: "Tạo khuyến mãi",
        layout: "./layouts/admin",
    },
};

export async function renderAdminPromotionPage(req, res) {
    try {
        const { page = 1 } = req.query;
        const pageSize = 10;

        const promotions = await PromotionModel.find({ trangThaiXoa: false })
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        const totalPromotions = await PromotionModel.countDocuments({ trangThaiXoa: false });

        return res.render("admin/promotion/index", {
            ...VIEW_OPTIONS.PROMOTION_LIST,
            promotions,
            currentPage: page,
            totalPages: Math.ceil(totalPromotions / pageSize),
            filters: req.query,
        });
    } catch (error) {
        console.log("error: ", error);
        req.flash("error", error.message);
        return res.redirect("/admin/promotion");
    }
}

export async function renderAdminCreatePromotionPage(req, res) {
    const { page = 1 } = req.query;
    const pageSize = 10;

    const products = await ProductModel.find({ trangThaiXoa: false })
        .populate("maHangSanXuat")
        .populate("danhSachDanhMuc")
        .limit(pageSize)
        .skip((page - 1) * pageSize);

    const totalProducts = await ProductModel.countDocuments({ trangThaiXoa: false });

    return res.render("admin/promotion/create", {
        ...VIEW_OPTIONS.PROMOTION_CREATE,
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / pageSize),
        filters: req.query,
    });
}

export async function createPromotionHandler(req, res) {
    try {
        const { tenChuongTrinhKhuyenMai, giaTriKhuyenMai, moTa, ngayBatDau, ngayKetThuc, products } = req.body;

        // Kiểm tra ngày bắt đầu và kết thúc
        if (new Date(ngayBatDau) > new Date(ngayKetThuc)) {
            throw new Error("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
        }

        // Xử lý danh sách sản phẩm
        const danhSachSanPhamApDung = products?.length
            ? products.map((product) => new mongoose.Types.ObjectId(product))
            : []; // Mảng rỗng nếu không có sản phẩm được chọn

        // Kiểm tra logic trùng lặp
        const filterConditions =
            danhSachSanPhamApDung.length > 0
                ? {
                      trangThaiXoa: false,
                      danhSachSanPhamApDung: { $in: danhSachSanPhamApDung },
                      $or: [
                          {
                              ngayBatDau: { $lt: new Date(ngayKetThuc) },
                              ngayKetThuc: { $gt: new Date(ngayBatDau) },
                          },
                      ],
                  }
                : {
                      trangThaiXoa: false,
                      danhSachSanPhamApDung: { $size: 0 }, // Khuyến mãi áp dụng toàn bộ sản phẩm
                      $or: [
                          {
                              ngayBatDau: { $lt: new Date(ngayKetThuc) },
                              ngayKetThuc: { $gt: new Date(ngayBatDau) },
                          },
                      ],
                  };

        const existedPromotion = await PromotionModel.findOne(filterConditions);

        if (existedPromotion) {
            throw new Error(
                danhSachSanPhamApDung.length === 0
                    ? "Đã tồn tại một chương trình khuyến mãi áp dụng cho toàn bộ sản phẩm trong khoảng thời gian này"
                    : "Sản phẩm đã được áp dụng cho chương trình khuyến mãi khác"
            );
        }

        // Tạo khuyến mãi
        const promotion = new PromotionModel({
            tenChuongTrinhKhuyenMai,
            giaTriKhuyenMai: Number(giaTriKhuyenMai),
            moTa,
            ngayBatDau: new Date(ngayBatDau),
            ngayKetThuc: new Date(ngayKetThuc),
            danhSachSanPhamApDung,
        });

        await promotion.save();

        promotion.maChuongTrinhKhuyenMai = promotion._id;
        await promotion.save();

        req.flash("message", "Tạo chương trình khuyến mãi thành công");
        return res.redirect("/admin/promotion");
    } catch (error) {
        console.log("error: ", error);
        req.flash("error", error.message);
        return res.redirect("/admin/promotion");
    }
}

export async function renderAdminEditPromotionPage(req, res) {
    try {
        const { id } = req.params;

        const promotion = await PromotionModel.findOne({
            maChuongTrinhKhuyenMai: new mongoose.Types.ObjectId(id),
        }).lean();

        if (!promotion) {
            throw new Error("Không tìm thấy chương trình khuyến mãi");
        }

        const { page = 1 } = req.query;
        const pageSize = 10;

        const products = await ProductModel.find({ trangThaiXoa: false })
            .populate("maHangSanXuat")
            .populate("danhSachDanhMuc")
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        const totalProducts = await ProductModel.countDocuments({ trangThaiXoa: false });

        promotion.ngayBatDau = new Date(promotion.ngayBatDau).toISOString().split("T")[0];
        promotion.ngayKetThuc = new Date(promotion.ngayKetThuc).toISOString().split("T")[0];

        return res.render("admin/promotion/edit", {
            ...VIEW_OPTIONS.PROMOTION_CREATE,
            promotion,
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / pageSize),
            filters: req.query,
        });
    } catch (error) {
        console.log("error: ", error);

        req.flash("error", error.message);
        return res.redirect("/admin/promotion");
    }
}

export async function editPromotionHandler(req, res) {
    try {
        const {
            maChuongTrinhKhuyenMai,
            tenChuongTrinhKhuyenMai,
            giaTriKhuyenMai,
            moTa,
            ngayBatDau,
            ngayKetThuc,
            products,
        } = req.body;

        const promotion = await PromotionModel.findOne({
            maChuongTrinhKhuyenMai: new mongoose.Types.ObjectId(maChuongTrinhKhuyenMai),
        });
        if (!promotion) {
            throw new Error("Chương trình khuyến mãi không tồn tại");
        }

        // Kiểm tra ngày bắt đầu và kết thúc
        if (new Date(ngayBatDau) > new Date(ngayKetThuc)) {
            throw new Error("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
        }

        // Xử lý danh sách sản phẩm
        const danhSachSanPhamApDung = products?.length
            ? products.map((product) => new mongoose.Types.ObjectId(product))
            : []; // Mảng rỗng nếu không có sản phẩm được chọn

        // Kiểm tra logic trùng lặp
        const filterConditions =
            danhSachSanPhamApDung.length > 0
                ? {
                      maChuongTrinhKhuyenMai: { $ne: maChuongTrinhKhuyenMai }, // Loại bỏ chính chương trình hiện tại
                      trangThaiXoa: false,
                      danhSachSanPhamApDung: { $in: danhSachSanPhamApDung },
                      $or: [
                          {
                              ngayBatDau: { $lt: new Date(ngayKetThuc) },
                              ngayKetThuc: { $gt: new Date(ngayBatDau) },
                          },
                      ],
                  }
                : {
                      maChuongTrinhKhuyenMai: { $ne: maChuongTrinhKhuyenMai }, // Loại bỏ chính chương trình hiện tại
                      trangThaiXoa: false,
                      danhSachSanPhamApDung: { $size: 0 }, // Khuyến mãi áp dụng toàn bộ sản phẩm
                      $or: [
                          {
                              ngayBatDau: { $lt: new Date(ngayKetThuc) },
                              ngayKetThuc: { $gt: new Date(ngayBatDau) },
                          },
                      ],
                  };

        const existedPromotion = await PromotionModel.findOne(filterConditions);

        if (existedPromotion) {
            throw new Error(
                danhSachSanPhamApDung.length === 0
                    ? "Đã tồn tại một chương trình khuyến mãi áp dụng cho toàn bộ sản phẩm trong khoảng thời gian này"
                    : "Sản phẩm đã được áp dụng cho chương trình khuyến mãi khác"
            );
        }

        // Cập nhật thông tin chương trình khuyến mãi
        promotion.tenChuongTrinhKhuyenMai = tenChuongTrinhKhuyenMai;
        promotion.giaTriKhuyenMai = Number(giaTriKhuyenMai);
        promotion.moTa = moTa;
        promotion.ngayBatDau = new Date(ngayBatDau);
        promotion.ngayKetThuc = new Date(ngayKetThuc);
        promotion.danhSachSanPhamApDung = danhSachSanPhamApDung;

        await promotion.save();

        req.flash("message", "Cập nhật chương trình khuyến mãi thành công");
        return res.redirect("/admin/promotion");
    } catch (error) {
        console.log("error: ", error);
        req.flash("error", error.message);
        return res.redirect(`/admin/promotion/edit/${req.body.maChuongTrinhKhuyenMai}`);
    }
}

export async function deletePromotionHandler(req, res) {
    try {
        const { id } = req.params;

        const promotion = await PromotionModel.findOne({
            maChuongTrinhKhuyenMai: new mongoose.Types.ObjectId(id),
        });

        if (!promotion) {
            throw new Error("Không tìm thấy chương trình khuyến mãi");
        }

        promotion.trangThaiXoa = true;

        await promotion.save();

        req.flash("message", "Xóa chương trình khuyến mãi thành công");

        return res.redirect("/admin/promotion");
    } catch (error) {
        console.log("error: ", error);
        req.flash("error", error.message);
        return res.redirect("/admin/promotion");
    }
}
