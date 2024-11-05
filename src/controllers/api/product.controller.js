import SanPhamModel from "../../models/sanPham.model.js"
import KichCoModel from "../../models/kichCo.model.js"

import mongoose from "mongoose";
// Get Product Information
// [GET] /api/product/
export async function getAllProduct(req, res) {

    const product = await SanPhamModel.find({}).select();

    if (product) {
        return res.json(product);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
}
export async function getProductById(req, res) {
    const productId = req.params.id;
    
    const product = await SanPhamModel.findOne({ maSanPham: productId }).sort({maSanPham: 1});
    if (product) {
        return res.json(product);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
}
// Get Product Size By Id
// [GET] /api/product-size/:id
export async function getSizeById(req, res) {
    const sizeId = req.params.id;

    const size = await KichCoModel.findOne({maKichCo : sizeId}).sort({maKichCo: 1});
    console.log(size)
    if (size) {
        return res.json(size);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy kích cỡ này' });
    }
}