import mongoose from "mongoose";

const chiTietPhieuNhap = new mongoose.Schema({
    maSanPham: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SanPham",
        required: true,
    },
    danhSachKichCo: [
        {
            maKichCo: {
                type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    nhaCungCap: {
        type: mongoose.Schema.Types.ObjectId,
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
