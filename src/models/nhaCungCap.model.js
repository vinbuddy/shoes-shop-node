import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const NhaCungCapSchema = new mongoose.Schema({
    maNhaCungCap: {
        type: String,
        default: uuidv4,
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
