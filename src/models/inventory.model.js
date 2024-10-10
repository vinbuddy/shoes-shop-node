import mongoose from "mongoose";

const productInventorySizeSchema = new mongoose.Schema({
    inventorySize: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
        required: true,
    },
    inventorySizeQuantity: {
        type: Number,
        required: true,
        default: 0,
    },
    inventorySizePrice: {
        type: Number,
        required: true,
    },
});

const inventorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        inventorySizes: [productInventorySizeSchema],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const InventoryModel = mongoose.model("InventoryModel", inventorySchema);

export default InventoryModel;
