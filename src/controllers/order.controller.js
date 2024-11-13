import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
// import mongoose from "mongoose";
import env from "dotenv";

env.config();

// const VIEW_OPTIONS = {
//     ADMIN_CREATE: {
//         layout: "./layouts/admin",
//         title: "Thêm đơn hàng",
//     },
//     ADMIN_LIST: {
//         layout: "./layouts/admin",
//         title: "Danh sách đơn hàng",
//     },
//     ORDER_CANCLE: {
//         layout: "./layouts/main",
//         title: "Product detail",
//     },

// };
export const cancelOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId);

    if (!order) {
        return res.redirect("/user/order");
    }
    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai;

    if (!status.slice(0, 2).some((s) => s.maTrangThai.toString() == statusCodes)) {
        return res.redirect("/user/order");
    }

    const thirdStatus = status[3];

    await DonHangModel.findOneAndUpdate(
        { maDonHang: orderId },
        {
            $push: {
                trangThaiDonHang: {
                    maTrangThai: thirdStatus.maTrangThai,
                    _id: thirdStatus.maTrangThai,
                    thoiGian: new Date(),
                },
            },
        }
    );
    return res.redirect("/user/order");
};
