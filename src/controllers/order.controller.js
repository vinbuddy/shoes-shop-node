import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
import mongoose from "mongoose";
import env from "dotenv";

env.config();

const VIEW_OPTIONS = {
    ADMIN_CREATE: {
        layout: "./layouts/admin",
        title: "Thêm đơn hàng",
    },
    ADMIN_LIST: {
        layout: "./layouts/admin",
        title: "Danh sách đơn hàng",
    },
    ORDER_DETAIL: {
        layout: "./layouts/admin",
        title: "chi tiết đơn hàng",
    },
};

export const renderAdminOrderPage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const searchStatus = req.query.status;
    let query = {};
    if (searchStatus) {
        query = {
            $expr: {
                $eq: [
                    { $arrayElemAt: ["$trangThaiDonHang.maTrangThai", -1] },
                    new mongoose.Types.ObjectId(searchStatus),
                ],
            },
        };
    }

    const orders = await DonHangModel.find(query)
        .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
        .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
        .sort({ "trangThaiDonHang.thoiGian": -1 })
        .skip(skip)
        .limit(limit)
        .exec();

    const totalOrders = await DonHangModel.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const status = await TrangThaiModel.find();
    const orderList = [];

    for (const order of orders) {
        const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
        const id = latestStatus.maTrangThai._id;
        const statusOrder = status.findIndex((status) => status._id.equals(id));
        orderList.push({
            ...order._doc,
            trangThai: statusOrder,
        });
    }

    return res.render("admin/order", {
        ...VIEW_OPTIONS.ADMIN_LIST,
        orders: orderList,
        statuses: status,
        currentPage: page,
        totalPages: totalPages,
        filters: req.query,
        searchStatus: searchStatus,
    });
};

export const renderAdminOrderDetailPage = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId)
        .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien email " })
        .populate({ path: "trangThaiDonHang.maTrangThai", select: "maTrangThai tenTrangThai" })
        .populate({ path: "chiTietDonHang.maSanPham", select: "tenSanPham giaSanPham hinhAnhDaiDien" })
        .populate({ path: "chiTietDonHang.maKichCoSanPham", select: "tenKichCo" })
        .exec();
    const status = await TrangThaiModel.find();
    return res.render("admin/order/detail", {
        ...VIEW_OPTIONS.ORDER_DETAIL,
        order: order,
        statuses: status,
    });
};

export const updateOrderStatus = async (req, res) => {
    const { id: orderId } = req.params;
    console.log(orderId);
    const { status: statusId } = req.body;
    const order = await DonHangModel.findById(orderId);

    if (!order) {
        return res.redirect("/admin/order/");
    }

    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai.toString();

    if (statusCodes === statusId) {
        return res.redirect("/admin/order/detail/" + orderId);
    }

    const nextStatus = status.find((s) => s._id.equals(statusId));

    await DonHangModel.findOneAndUpdate(
        { maDonHang: orderId },
        {
            $push: {
                trangThaiDonHang: {
                    maTrangThai: nextStatus._id,
                    _id: nextStatus._id,
                    thoiGian: new Date(),
                },
            },
        }
    );

    return res.redirect("/admin/order/detail/" + orderId);
};
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

    const thirdStatus = status[4];

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
export const refundOrder = async (req, res) => {
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

    const sixthStatus = status[5];

    await DonHangModel.findOneAndUpdate(
        { maDonHang: orderId },
        {
            $push: {
                trangThaiDonHang: {
                    maTrangThai: sixthStatus.maTrangThai,
                    _id: sixthStatus.maTrangThai,
                    thoiGian: new Date(),
                },
            },
        }
    );
    return res.redirect("/user/order");
};

export const nextStatus = async (req, res) => {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.redirect("/admin/order/");
    }

    if (!orderIds) {
        return res.redirect("/admin/order/");
    }

    Promise.all(
        orderIds.map(async (orderId) => {
            const order = await DonHangModel.findById(orderId);

            const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
            const status = await TrangThaiModel.find();
            const statusCodes = latestStatus.maTrangThai.toString();

            const currentIndex = status.findIndex((s) => s._id.equals(statusCodes));
            const nextStatus = status[currentIndex + 1];

            await DonHangModel.findOneAndUpdate(
                { maDonHang: orderId },
                {
                    $push: {
                        trangThaiDonHang: {
                            maTrangThai: nextStatus._id,
                            _id: nextStatus._id,
                            thoiGian: new Date(),
                        },
                    },
                }
            );
        })
    )
        .then(() => {
            res.status(200).json({ message: "Order status updated successfully" });
        })
        .catch((error) => {
            res.status(500).json({ message: "Failed to update order status", error });
        });
};
