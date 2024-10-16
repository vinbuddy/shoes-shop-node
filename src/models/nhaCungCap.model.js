import mongoose from "mongoose";

const NhaCungCapSchema = new mongoose.Schema({
    maNhaCungCap: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    tenNhaCungCap: {
        type: String,
        required: true,
    },
    nguoiLienHe: {
        type: String,
        required: true,
    },
    soDienThoai: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    diaChi: {
        type: String,
        required: true,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const NhaSanXuatModel = mongoose.model("NhaCungCap", NhaCungCapSchema);

export default NhaSanXuatModel;
