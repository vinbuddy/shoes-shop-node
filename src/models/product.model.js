import mongoose from "mongoose";

const productSizeSchema = new mongoose.Schema({
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        images: [
            {
                type: String,
                default: [],
            },
        ],
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: false,
            default: null,
        },
        quantity: {
            type: Number,
            required: false,
            default: null,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true,
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        sizes: [productSizeSchema],
        isFeatured: {
            type: Boolean,
            default: false,
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

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
