import mongoose from "mongoose";

const vaiTroSchema = new mongoose.Schema({
    maVaiTro: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    tenVaiTro: {
        type: String,
        required: true,
        unique: true,
    },
    moTaVaiTro: {
        type: String,
        default: null,
    },
});

const VaiTroModel = mongoose.model("VaiTro", vaiTroSchema);

export default VaiTroModel;
