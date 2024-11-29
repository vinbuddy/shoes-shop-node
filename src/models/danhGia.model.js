import mongoose from "mongoose";

const Schema = mongoose.Schema;

const danhGiaSchema = new Schema({
    maDanhGia: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    maSanPham: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SanPham",
        required: null,
    },
    maDonHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DonHang",
        default: null,
    },
    maKhachHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KhachHang",
        default: null,
    },
    soDiem: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    noiDungDanhGia: {
        type: String,
        default: null,
    },
    ngayDanhGia: {
        type: Date,
        default: Date.now,
    },
});
const DanhGiaModel = mongoose.model("DanhGia", danhGiaSchema);
export default DanhGiaModel;
