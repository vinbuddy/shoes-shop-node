import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const kichCoSchema = new mongoose.Schema({
    maKichCo: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    tenKichCo: {
        type: String,
        required: true,
        unique: true,
    },
    moTaKichCo: {
        type: String,
        default: null,
    },
});

const KichCoModel = mongoose.model("KichCo", kichCoSchema);

export default KichCoModel;
