import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default:
                "https://res.cloudinary.com/dtbhvc4p4/image/upload/v1720978549/profile/344060599-e8733bc3-ac77-42c6-b036-b9f1fb31b21c_hlh6by.png",
        },
        googleId: {
            type: String,
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
