import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const nguoiDungSchema = new mongoose.Schema({
    maNguoiDung: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    tenNguoiDung: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        default: null,
    },
    matKhau: {
        type: String,
        required: true,
    },
    anhDaiDien: {
        type: String,
        default:
            "https://res.cloudinary.com/dtbhvc4p4/image/upload/v1720978549/profile/344060599-e8733bc3-ac77-42c6-b036-b9f1fb31b21c_hlh6by.png",
    },
    maVaiTro: {
        type: String,
        ref: "VaiTro",
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const NguoiDungModel = mongoose.model("NguoiDung", nguoiDungSchema);

export default NguoiDungModel;
