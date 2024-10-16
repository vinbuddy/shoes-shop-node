import mongoose from "mongoose";

const hangSanXuatSchema = new mongoose.Schema({
    maHangSanXuat: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
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
