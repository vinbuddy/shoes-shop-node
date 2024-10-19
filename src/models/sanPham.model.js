import mongoose from "mongoose";

const kichCoSanPham = new mongoose.Schema({
    maKichCo: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    tenSanPham: {
        type: String,
        required: true,
        unique: true,
    },
    hinhAnhDaiDien: {
        type: String,
        default: null,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "HangSanXuat",
        required: true,
    },
    danhSachDanhMuc: [
        {
            type: mongoose.Schema.Types.ObjectId,
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
