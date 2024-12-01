import mongoose from "mongoose";
import bcrypt from "bcrypt";

const nguoiDungSchema = new mongoose.Schema({
    maNguoiDung: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true,
    },
    tenNguoiDung: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        default: null,
    },
    matKhau: {
        type: String,
        required: true,
    },
    anhDaiDien: {
        type: String,
        default:
            "https://res.cloudinary.com/dtbhvc4p4/image/upload/v1720978549/profile/344060599-e8733bc3-ac77-42c6-b036-b9f1fb31b21c_hlh6by.png",
    },
    maVaiTro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaiTro",
    },
    trangThaiXoa: {
        type: Boolean,
        default: false,
    },
});

nguoiDungSchema.pre("save", async function (next) {
    if (this.isModified("matKhau")) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.matKhau, salt);

        this.matKhau = hashedPassword;
    }
    next();
});

const NguoiDungModel = mongoose.model("NguoiDung", nguoiDungSchema);

export default NguoiDungModel;
