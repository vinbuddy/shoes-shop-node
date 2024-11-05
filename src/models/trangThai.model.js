import mongoose from "mongoose";

const trangThaiSchema = new mongoose.Schema({
    maTrangThai: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    tenTrangThai: {
        type: String,
        required: true,
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

const TrangThaiModel = mongoose.model("TrangThai", trangThaiSchema);

export default TrangThaiModel;
