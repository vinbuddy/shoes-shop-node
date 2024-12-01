import mongoose from "mongoose";

const chuongTrinhKhuyenMai = new mongoose.Schema({
    maChuongTrinhKhuyenMai: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    tenChuongTrinhKhuyenMai: {
        type: String,
        required: true,
    },
    moTa: {
        type: String,
        default: "",
    },
    giaTriKhuyenMai: {
        type: Number,
        required: true,
    },
    danhSachSanPhamApDung: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SanPham",
        },
    ],
    ngayBatDau: {
        type: Date,
        required: true,
    },
    ngayKetThuc: {
        type: Date,
        required: true,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const ChuongTrinhKhuyenMaiModel = mongoose.model("ChuongTrinhKhuyenMai", chuongTrinhKhuyenMai);

export default ChuongTrinhKhuyenMaiModel;
