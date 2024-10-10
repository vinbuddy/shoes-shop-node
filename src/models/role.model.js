import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const RoleModel = mongoose.model("Role", roleSchema);

export default RoleModel;
