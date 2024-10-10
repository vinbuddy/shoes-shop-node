import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const paymentInfoSchema = new mongoose.Schema({
    paymentMethod: {
        type: String,
        enum: ["Momo", "VNPay", "Tiền mặt"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["Đang chờ", "Hoàn thành", "Thất bại"],
        default: "Đang chờ",
    },
    transactionId: {
        type: String, // ID giao dịch từ hệ thống thanh toán
    },
    refundStatus: {
        type: String,
        enum: ["Chưa hoàn tiền", "Đã hoàn tiền", "Hoàn tiền thất bại"],
        default: "Chưa hoàn tiền",
    },
    refundTransactionId: {
        type: String, // ID giao dịch hoàn tiền từ hệ thống thanh toán,
        default: null,
    },
});

const deliveryInfoSchema = new mongoose.Schema({
    shippingCost: {
        type: Number,
        default: 10000,
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    receiverName: {
        type: String,
        required: true,
    },
    receiverPhoneNumber: {
        type: String,
        required: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            default: null,
        },
        items: [orderItemSchema],
        deliveryInfo: deliveryInfoSchema,
        totalPrice: {
            type: Number,
            required: true,
        },
        paymentInfo: paymentInfoSchema,
        orderStatuses: [
            {
                statusName: {
                    type: String,
                    enum: [
                        "Chờ xác nhận",
                        "Đang chuẩn bị hàng",
                        "Đang giao",
                        "Đã giao",
                        "Hoàn thành",
                        "Đã hủy",
                        "Đã trả hàng",
                    ],
                    required: true,
                },
                time: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
