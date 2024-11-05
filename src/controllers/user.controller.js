import DonHangModel from "../models/donHang.model.js";

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
    orders.forEach((order) => {
        const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
        switch (latestStatus.tenTrangThai) {
            case "Chờ xác nhận":
                pendingOrders.push(order);
                break;
            case "Đang giao":
                shippedOrders.push(order);
                break;
            case "Đã giao":
                deliveredOrders.push(order);
                break;
            case "Đã hủy":
                cancelOrders.push(order);
                break;
            case "Hoàn thành":
                completedOrders.push(order);
                break;
            case "Đã trả hàng":
                refundOrders.push(order);
                break;
            default:
                break;
        }
    });

    return res.render("user/order", {
        layout: "./layouts/user",
        page: "order",
        title: "Order",
        customer: customer,
        orders: orders,
        pendingOrders: pendingOrders,
    });
}
