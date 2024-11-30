import KichCoModel from "../models/kichCo.model.js";
import SizeModel from "../models/kichCo.model.js";

export async function functionName (req, res, next) {

}

// API

// Get All Size Information
// [GET] /api/size/
export async function getAllSize(req, res) {

    const sizes = await SizeModel.find({}).select();

    if (sizes) {
        return res.json(sizes);
    } else {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
}

// [POST] /api/addSize
export async function addSize(req, res) {

    const { tenKichCo, moTaKichCo } = req.body;
    
    if (!tenKichCo) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    const size = new KichCoModel({
        tenKichCo: tenKichCo,
        moTaKichCo: moTaKichCo,
        trangThaiXoa: false
    });

    const savedSize = await size.save();
    savedSize.maKichCo = savedSize._id;

    await savedSize.save();

    return res.status(200).json({
        message: 'Dữ liệu đã lưu thành công.',
        size: savedSize
    });
}