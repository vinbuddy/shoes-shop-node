import mongoose from "mongoose";

const monHangSchema = new mongoose.Schema({
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
    soLuongSanPham: {
        type: Number,
        required: true,
        min: 1,
    },
    giaSanPham: {
        type: Number,
        required: true,
    },
});

const gioHangSchema = new mongoose.Schema({
    maGioHang: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    maKhachHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KhachHang",
        required: true,
    },
    danhSachSanPham: [monHangSchema],
    tongTien: {
        type: Number,
        required: true,
        default: 0,
    },
});

const GioHangModel = mongoose.model("GioHang", gioHangSchema);

export default GioHangModel;
