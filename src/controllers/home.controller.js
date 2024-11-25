import SanPhamModel from "../models/sanPham.model.js";
import HangSanXuatModel from "../models/hangSanXuat.model.js";
import PromotionModel from "../models/chuongTrinhKhuyenMai.model.js";

import { formatVNCurrency } from "../utils/format.js";

export async function renderHomePage(req, res) {
    const brands = await HangSanXuatModel.find({
        tenHangSanXuat: { $in: ["Nike", "Adidas", "Puma"] },
        trangThaiXoa: false,
    });

    const nikeBrand = brands.find((brand) => brand.tenHangSanXuat === "Nike");
    const adidasBrand = brands.find((brand) => brand.tenHangSanXuat === "Adidas");
    const pumaBrand = brands.find((brand) => brand.tenHangSanXuat === "Puma");

    const nikeProducts = await SanPhamModel.find({ maHangSanXuat: nikeBrand.maHangSanXuat, trangThaiXoa: false }).limit(
        8
    );

    const adidasProducts = await SanPhamModel.find({
        maHangSanXuat: adidasBrand.maHangSanXuat,
        trangThaiXoa: false,
    }).limit(8);

    const pumaProducts = await SanPhamModel.find({ maHangSanXuat: pumaBrand.maHangSanXuat, trangThaiXoa: false }).limit(
        8
    );

    // Tìm khuyến mãi đang diễn ra
    const promotions = await PromotionModel.find({
        ngayKetThuc: { $gte: new Date() },
        trangThaiXoa: false,
    });

    return res.render("index", {
        layout: "./layouts/main",
        page: "home",
        title: "Shoes Shop",
        nikeProducts,
        adidasProducts,
        pumaProducts,
        promotions,
        formatVNCurrency,
    });
}
