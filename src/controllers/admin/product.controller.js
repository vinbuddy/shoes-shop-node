import NhaSanXuatModel from "../../models/nhaCungCap.model.js";
import SanPhamModel from "../../models/sanPham.model.js"

//  Receipt of goods and up vote import. 
export async function renderCreateGoodsReceipt (req, res, next) {
    try {
        const suppliers = await NhaSanXuatModel.find({}).select();
        const products = await SanPhamModel.find({}).select();
        const data = {
            'suppliers' : suppliers,
            'products': products,
        }
        console.log(data)
        return res.render("admin/product/goods-receipt", {
            layout: "./layouts/main",
            page: "goods-receipt",
            title: "Phiếu nhập hàng",
            data: data,
        });
    } catch (error) {
        next(error);
    }
}