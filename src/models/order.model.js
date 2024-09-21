import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
