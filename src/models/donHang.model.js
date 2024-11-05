import mongoose from "mongoose";

const chiTietDonHangSchema = new mongoose.Schema({
    maSanPham: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SanPham",
        required: true,
    },
    maKichCoSanPham: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KichCo",
        required: true,
    },
    soLuongDaChon: {
        type: Number,
        required: true,
        min: 1,
    },
    giaDaChon: {
        type: Number,
        required: true,
    },
});

const thongTinThanhToanSchema = new mongoose.Schema({
    phuongThucThanhToan: {
        type: String,
        enum: ["MoMo", "VNPay", "Tiền mặt"],
        required: true,
    },
    trangThaiThanhToan: {
        type: String,
        enum: ["Đang chờ", "Hoàn thành", "Thất bại"],
        default: "Đang chờ",
    },
    maGiaoDich: {
        type: String, // ID giao dịch từ hệ thống thanh toán
        default: null,
    },
    trangThaiHoanTien: {
        type: String,
        enum: ["Chưa hoàn tiền", "Đã hoàn tiền", "Hoàn tiền thất bại"],
        default: "Chưa hoàn tiền",
    },
    maGiaoDichHoanTien: {
        type: String, // ID giao dịch hoàn tiền từ hệ thống thanh toán,
        default: null,
    },
});

const thongTinGiaoHangSchema = new mongoose.Schema({
    phiVanChuyen: {
        type: Number,
        default: 10000,
    },
    diaChiGiaoHang: {
        type: String,
        required: true,
    },
    tenNguoiNhan: {
        type: String,
        required: true,
    },
    soDienThoaiNguoiNhan: {
        type: String,
        required: true,
    },
});
const trangThaiDonHangSchema = new mongoose.Schema({
    maTrangThai: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TrangThai",
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    thoiGian: {
        type: Date,
        default: Date.now,
    },
});
const donHangSchema = new mongoose.Schema({
    maDonHang: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    maKhachHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KhachHang",
        default: null,
    },
    maNguoiTao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NguoiDung",
        default: null,
    },
    chiTietDonHang: [chiTietDonHangSchema],
    thongTinGiaoHang: thongTinGiaoHangSchema,
    tongTienThanhToan: {
        type: Number,
        required: true,
    },
    thongTinThanhToan: thongTinThanhToanSchema,
    trangThaiDonHang: [trangThaiDonHangSchema],
    ngayDatHang: {
        type: Date,
        default: Date.now,
    },
});

const DonHangModel = mongoose.model("DonHang", donHangSchema);

export default DonHangModel;
