import mongoose from "mongoose";

const kichCoTonKhoSchema = new mongoose.Schema({
    kichThuocTonKho: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    maSanPham: {
        type: mongoose.Schema.Types.ObjectId,
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
