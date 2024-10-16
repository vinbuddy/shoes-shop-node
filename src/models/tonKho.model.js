import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const kichCoTonKhoSchema = new mongoose.Schema({
    kichThuocTonKho: {
        type: String,
        ref: "KichCo",
        required: true,
    },
    soLuongTonKho: {
        type: Number,
        required: true,
        default: 0,
    },
    giaTonKho: {
        type: Number,
        required: true,
    },
});

const tonKhoSchema = new mongoose.Schema({
    maTonKho: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    maSanPham: {
        type: String,
        ref: "SanPham",
        required: true,
    },
    danhSachKichCoTonKho: [kichCoTonKhoSchema],
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const TonKhoModel = mongoose.model("TonKho", tonKhoSchema);

export default TonKhoModel;
