import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chiTietPhieuNhap = new mongoose.Schema({
    maSanPham: {
        type: String,
        ref: "SanPham",
        required: true,
    },
    danhSachKichCo: [
        {
            maKichCo: {
                type: String,
                ref: "KichCo",
                required: true,
            },
            soLuongKichCo: {
                type: Number,
                required: true,
                min: 1,
            },
            giaKichCo: {
                type: Number,
                required: true,
            },
        },
    ],
});

const phieuNhapSchema = new mongoose.Schema({
    maPhieuNhap: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    nhaCungCap: {
        type: String,
        ref: "NhaCungCap",
        required: true,
    },
    ngayNhap: {
        type: Date,
        default: Date.now,
    },
    chiTiet: [chiTietPhieuNhap],
});

const PhieuNhapModel = mongoose.model("PhieuNhap", phieuNhapSchema);

export default PhieuNhapModel;
