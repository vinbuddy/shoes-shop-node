import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const vaiTroSchema = new mongoose.Schema({
    maVaiTro: {
        type: String,
        default: uuidv4,
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
