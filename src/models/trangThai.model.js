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
});

const TrangThaiModel = mongoose.model("TrangThai", trangThaiSchema);

export default TrangThaiModel;
