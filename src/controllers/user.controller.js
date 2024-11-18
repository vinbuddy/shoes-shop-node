import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
// import NguoiDungModel from "../models/nguoidung.model.js";

export async function renderUserProfilePage(req, res) {
    const customer = req.session.customer;

    return res.render("user/index", {
        layout: "./layouts/user",
        page: "profile",
        title: "Profile",
        customer: customer,
    });
}
export async function renderUserOrderPage(req, res) {
    const customer = req.session.customer;
    const orders = await DonHangModel.find({ maKhachHang: customer.maKhachHang })
        .populate({
            path: "chiTietDonHang.maSanPham",
            select: "tenSanPham giaSanPham hinhAnhDaiDien",
        })
        .populate({
            path: "chiTietDonHang.maKichCoSanPham",
            select: "tenKichCo",
        })
        .exec();

    const pendingOrders = [];
    const shippedOrders = [];
    const deliveredOrders = [];
    const cancelOrders = [];
    const completedOrders = [];
    const refundOrders = [];
    const status = await TrangThaiModel.find();
    for (const order of orders) {
        const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
        const id = latestStatus.maTrangThai;
        const statusOrder = status.findIndex((status) => status._id.equals(id));
        order.statusOrder = statusOrder;
        switch (statusOrder) {
            case 0: // Chờ xác nhận
                pendingOrders.push(order);
                break;
            case 1: // Đang giao
                shippedOrders.push(order);
                break;
            case 2: // Đã giao
                deliveredOrders.push(order);
                break;
            case 3: // Hoàn thành
                completedOrders.push(order);
                break;
            case 4: // Đã hủy
                cancelOrders.push(order);
                break;
            case 5: //  trả hàng
            case 6: // trả hàng
            case 7: // trả hàng
                refundOrders.push(order);
                break;
            default:
                break;
        }
    }

    return res.render("user/order", {
        layout: "./layouts/user",
        page: "order",
        title: "Order",
        customer: customer,
        orders: orders,
        pendingOrders: pendingOrders,
        shippedOrders: shippedOrders,
        deliveredOrders: deliveredOrders,
        cancelOrders: cancelOrders,
        completedOrders: completedOrders,
        refundOrders: refundOrders,
        status: status,
    });
}
