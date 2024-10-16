import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const khachHangSchema = new mongoose.Schema({
    maKhachHang: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    tenKhachHang: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    matKhau: {
        type: String,
        required: false,
        default: null,
    },
    anhDaiDien: {
        type: String,
        default:
            "https://res.cloudinary.com/dtbhvc4p4/image/upload/v1720978549/profile/344060599-e8733bc3-ac77-42c6-b036-b9f1fb31b21c_hlh6by.png",
    },
    googleId: {
        type: String,
        default: null,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
    trangThaiXacThuc: {
        type: Boolean,
        default: false,
    },
});

khachHangSchema.pre("save", async function (next) {
    if (this.isModified("matKhau")) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.matKhau, salt);

        this.matKhau = hashedPassword;
    }
    next();
});

const KhachHangModel = mongoose.model("KhachHang", khachHangSchema);

export default KhachHangModel;
