import mongoose from "mongoose";

const Schema = mongoose.Schema;

const danhGiaSchema = new Schema({
    MaDanhGia: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    MaSanPham: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SanPham",
        required: null,
    },
    MaDonHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DonHang",
        default: null,
    },
    MaKhachHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KhachHang",
        default: null,
    },
    SoDiem: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    NoiDungDanhGia: {
        type: String,
        default: null,
    },
    NgayDanhGia: {
        type: Date,
        default: Date.now,
    },
});
const DanhGiaModel = mongoose.model("DanhGia", danhGiaSchema);
export default DanhGiaModel;
