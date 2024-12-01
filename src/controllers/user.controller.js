import DanhGiaModel from "../models/danhGia.model.js";
import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
import khachHangModel from "../models/khachHang.model.js";

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
        .populate({
            path: "thongTinDoiTraHang.chiTietDoiTraHang.maSanPham",
        })
        .populate({
            path: "thongTinDoiTraHang.chiTietDoiTraHang.maKichCoSanPham",
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
        const danhgia = await DanhGiaModel.findOne({ maDonHang: order.maDonHang });
        if (danhgia) {
            order.daDanhgia = true;
        }
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
            case 5: // yêu cầu trả hàng
                refundOrders.push(order);
                break;
            default:
                break;
        }
    }

    return res.render("order/index", {
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

export async function renderUserOrderDetailPage(req, res) {
    const { id } = req.params;
    const customer = req.session.customer;
    const order = await DonHangModel.findById(id)
        .populate({
            path: "chiTietDonHang.maSanPham",
        })
        .populate({
            path: "thongTinDoiTraHang.chiTietDoiTraHang.maSanPham",
        })
        .populate({
            path: "chiTietDonHang.maKichCoSanPham",
            select: "tenKichCo",
        })
        .populate({
            path: "thongTinDoiTraHang.chiTietDoiTraHang.maKichCoSanPham",
            select: "tenKichCo",
        })
        .populate({ path: "maKhachHang" })
        .populate({ path: "trangThaiDonHang.maTrangThai" })
        .exec();
    return res.render("order/detail", {
        layout: "./layouts/user",
        page: "order",
        title: "Order Detail",
        order: order,
        customer: customer,
    });
}

export async function updateNameUser(req, res) {
    const { tenKhachHang } = req.body;
    const customer = req.session.customer;
    const user = await khachHangModel.findOne({ _id: customer._id });
    user.tenKhachHang = tenKhachHang;
    await user.save();
    req.session.customer = user;
    return res.redirect("/user/profile");
}
//Admin
export async function renderAdminProfilePage(req, res) {
    const user = req.session.user;

    return res.render("admin/user/profile", {
        layout: "./layouts/admin",
        page: "profile",
        title: "Admin Profile",
        user: user,
    });
}
