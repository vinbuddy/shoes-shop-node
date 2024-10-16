import mongoose from "mongoose";

const danhMucSchema = new mongoose.Schema({
    maDanhMuc: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
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
