import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const kichCoSanPham = new mongoose.Schema({
    maKichCo: {
        type: String,
        ref: "KichCo",
        required: true,
    },
    soLuongKichCo: {
        type: Number,
        required: true,
        default: 0,
    },
    giaKichCo: {
        type: Number,
        required: true,
    },
});

const sanPhamSchema = new mongoose.Schema({
    maSanPham: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    tenSanPham: {
        type: String,
        required: true,
        unique: true,
    },
    danhSachHinhAnh: [
        {
            type: String,
            default: [],
        },
    ],
    moTaSanPham: {
        type: String,
        required: true,
    },
    maHangSanXuat: {
        type: String,
        ref: "HangSanXuat",
        required: true,
    },
    danhSachDanhMuc: [
        {
            type: String,
            ref: "DanhMuc",
        },
    ],
    danhSachKichCo: [kichCoSanPham],
    trangThaiNoiBat: {
        type: Boolean,
        default: false,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
    ngayTao: {
        type: Date,
        default: Date.now,
    },
});

const SanPhamModel = mongoose.model("SanPham", sanPhamSchema);

export default SanPhamModel;
