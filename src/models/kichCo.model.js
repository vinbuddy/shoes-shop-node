import mongoose from "mongoose";

const kichCoSchema = new mongoose.Schema({
    maKichCo: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
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
