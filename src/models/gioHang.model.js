import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const monHangSchema = new mongoose.Schema({
    maSanPham: {
        type: String,
        ref: "SanPham",
        required: true,
    },
    kichCoSanPham: {
        type: String,
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
        type: String,
        default: uuidv4,
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

const CartModel = mongoose.model("GioHang", gioHangSchema);

export default CartModel;
