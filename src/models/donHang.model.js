import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chiTietDonHangSchema = new mongoose.Schema({
    maSanPham: {
        type: String,
        ref: "SanPham",
        required: true,
    },
    maKichCo: {
        type: String,
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
        enum: ["Momo", "VNPay", "Tiền mặt"],
        required: true,
    },
    trangThaiThanhToan: {
        type: String,
        enum: ["Đang chờ", "Hoàn thành", "Thất bại"],
        default: "Đang chờ",
    },
    maGiaoDich: {
        type: String, // ID giao dịch từ hệ thống thanh toán
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

const donHangSchema = new mongoose.Schema({
    maDonHang: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    maKhachHang: {
        type: String,
        ref: "KhachHang",
        default: null,
    },
    maNguoiTao: {
        type: String,
        ref: "NguoiDung",
        required: true,
    },
    chiTiet: [chiTietDonHangSchema],
    thongTinGiaoHang: thongTinGiaoHangSchema,
    tongTienThanhToan: {
        type: Number,
        required: true,
    },
    thongTinThanhToan: thongTinThanhToanSchema,
    trangThaiDonHang: [
        {
            tenTrangThai: {
                type: String,
                enum: [
                    "Chờ xác nhận",
                    "Đang chuẩn bị hàng",
                    "Đang giao",
                    "Đã giao",
                    "Hoàn thành",
                    "Đã hủy",
                    "Đã trả hàng",
                ],
                required: true,
            },
            thoiGian: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    ngayDatHang: {
        type: Date,
        default: Date.now,
    },
});

const DonHangModel = mongoose.model("DonHang", donHangSchema);

export default DonHangModel;
