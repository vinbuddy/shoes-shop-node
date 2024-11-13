import SanPhamModel from "../../models/sanPham.model.js"
import KichCoModel from "../../models/kichCo.model.js"
import PhieuNhapModel from "../../models/phieuNhap.js"

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
    
    if (size) {
        return res.json(size);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy kích cỡ này' });
    }
}
// Create Goods Receipt 
// [POST] /api/product/create-goods-receipt
export async function createGoodsReceipt(req, res) {
    const { nhaCungCap, chiTiet } = req.body;

    if (!nhaCungCap || !chiTiet || !Array.isArray(chiTiet)) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    try {
        const phieuNhap = new PhieuNhapModel({
            nhaCungCap: nhaCungCap,
            chiTiet: chiTiet,
        });
        
        for (const item of chiTiet) {
            let prod = await SanPhamModel.findOne({maSanPham: item.maSanPham});
            
            if (prod) {
                const updatedSizes = prod.danhSachKichCo.map((prodSize) => {
                    const receiptSize = item.danhSachKichCo.find((size) => size.maKichCo == prodSize.maKichCo);
                    if (receiptSize) {
                        prodSize.soLuongKichCo += receiptSize.soLuongKichCo;
                    }
                    return prodSize;
                });

                await SanPhamModel.updateOne({maSanPham: item.maSanPham}, {danhSachKichCo: updatedSizes})
                console.log(`Cập nhật số lượng sản phẩm: ${prod.tenSanPham} thành công.`);
            }
            else {
                console.log(`Không tìm thấy sản phẩm với mã: ${item.maSanPham}`);
            }
        }
        
        await phieuNhap.save();
        return res.status(200).json({ redirectUrl: "/admin/create-goods-receipt" });
    }
    catch (error) {
        console.error('Lỗi khi lưu phiếu nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
}