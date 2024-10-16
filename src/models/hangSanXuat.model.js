import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const hangSanXuatSchema = new mongoose.Schema({
    maHangSanXuat: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    tenHangSanXuat: {
        type: String,
        required: true,
    },
    moTa: {
        type: String,
        default: null,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const HangSanXuatModel = mongoose.model("HangSanXuat", hangSanXuatSchema);

export default HangSanXuatModel;
