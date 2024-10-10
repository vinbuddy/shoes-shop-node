import mongoose from "mongoose";

const goodsReceiptItem = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sizes: [
        {
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
        },
    ],
});

const goodsReceiptSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
        dateReceived: {
            type: Date,
            default: Date.now,
        },
        items: [goodsReceiptItem],
        totalQuantity: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const GoodsReceiptModel = mongoose.model("GoodsReceipt", goodsReceiptSchema);

export default GoodsReceiptModel;
