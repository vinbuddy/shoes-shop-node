import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const danhMucSchema = new mongoose.Schema({
    maDanhMuc: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    tenDanhMuc: {
        type: String,
        required: true,
    },
    moTa: {
        type: String,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const DanhMucModel = mongoose.model("DanhMuc", danhMucSchema);

export default DanhMucModel;
