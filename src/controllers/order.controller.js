import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
import mongoose from "mongoose";
import env from "dotenv";
import { uploadToCloudinary } from "../utils/cloudinary.js";
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
    ADMIN_LIST_REFUND: {
        layout: "./layouts/admin",
        title: "Danh sách đơn trả hàng",
    },
    ORDER_DETAIL: {
        layout: "./layouts/admin",
        title: "chi tiết đơn hàng",
    },
    USER_REFUND: {
        layout: "./layouts/user",
        title: "Yêu cầu trả hàng",
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
export const cancelOrderHandle = async (req, res) => {
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
export const refundOrderHandle = async (req, res) => {
    const { id, reason, description } = req.body;

    const order = await DonHangModel.findById(id);

    if (!order) {
        return res.redirect("/user/order");
    }
    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai;

    if (status.findIndex((s) => s.maTrangThai.toString() == statusCodes) !== 2) {
        return res.redirect("/user/order");
    }
    const files = req.files;
    const reasonImageFiles = files["reasonImageFiles"];
    let uploadedFiles = [];
    if (reasonImageFiles && reasonImageFiles.length > 0) {
        const uploadPromises = reasonImageFiles.map((file) => {
            let uploadPromise = uploadToCloudinary(file, "products");
            return uploadPromise;
        });
        uploadedFiles = await Promise.all(uploadPromises);
    }
    const sixthStatus = status[5];

    await DonHangModel.findOneAndUpdate(
        { maDonHang: id },
        {
            thongTinTraHang: {
                lyDoTraHang: reason,
                motaTraHang: description,
                danhSachHinhAnh: uploadedFiles.map((file) => file.url),
            },
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
export const completedOrderHandle = async (req, res) => {
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

    const fourthStatus = status[3];

    await DonHangModel.findOneAndUpdate(
        { maDonHang: orderId },
        {
            $push: {
                trangThaiDonHang: {
                    maTrangThai: fourthStatus.maTrangThai,
                    _id: fourthStatus.maTrangThai,
                    thoiGian: new Date(),
                },
            },
        }
    );
    return res.redirect("/user/order");
};
export const cancelRefundHandle = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId);
    if (!order) {
        return res.redirect("/user/order");
    }
    order.trangThaiDonHang.pop();
    await order.save();
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
export async function renderRefundClientPage(req, res) {
    const { id } = req.params;
    const customer = req.session.customer;
    const order = await DonHangModel.findById(id)
        .populate({ path: "maKhachHang" })
        .populate({ path: "trangThaiDonHang.maTrangThai" })
        .exec();
    return res.render("order/refund", {
        ...VIEW_OPTIONS.USER_REFUND,
        order: order,
        customer: customer,
    });
}

export async function renderRefundAdminPage(req, res) {
    const customer = req.session.customer;
    const orders = await DonHangModel.find({
        "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
    })
        .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
        .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
        .sort({ "trangThaiDonHang.thoiGian": -1 })
        .exec();

    const status = await TrangThaiModel.find();
    const orderList = [];
    for (const order of orders) {
        const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
        const id = latestStatus.maTrangThai._id;
        const statusOrder = status.findIndex((status) => status._id.equals(id));

        if (statusOrder === 5 || statusOrder === 6 || statusOrder === 7 || statusOrder === 8) {
            orderList.push({
                ...order._doc,
                trangThai: statusOrder,
            });
        }
    }

    return res.render("admin/order/refund", {
        ...VIEW_OPTIONS.ADMIN_LIST_REFUND,
        orders: orderList,
        customer: customer,
    });
}
export const fetchRefundOrders = async (req, res) => {
    const tabId = req.params.tabId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const orders = await DonHangModel.find({
        "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
    })
        .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
        .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
        .sort({ "trangThaiDonHang.thoiGian": -1 })
        .skip(skip)
        .limit(limit)
        .exec();

    const totalOrders = await DonHangModel.countDocuments({
        "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
    });
    const totalPages = Math.ceil(totalOrders / limit);

    const status = await TrangThaiModel.find();
    const orderList = [];
    for (const order of orders) {
        const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
        const id = latestStatus.maTrangThai._id;
        const statusOrder = status.findIndex((status) => status._id.equals(id));
        if (
            tabId == "all-orders" &&
            (statusOrder === 5 || statusOrder === 6 || statusOrder === 7 || statusOrder === 8)
        ) {
            orderList.push({
                ...order._doc,
                trangThai: statusOrder,
            });
        } else if (tabId == "request-refund" && statusOrder === 5) {
            orderList.push({
                ...order._doc,
                trangThai: statusOrder,
            });
        } else if (tabId == "accept-refund" && statusOrder === 6) {
            orderList.push({
                ...order._doc,
                trangThai: statusOrder,
            });
        } else if (tabId == "deny-refund" && statusOrder === 7) {
            orderList.push({
                ...order._doc,
                trangThai: statusOrder,
            });
        } else if (tabId == "completed-refund" && statusOrder === 8) {
            orderList.push({
                ...order._doc,
                trangThai: statusOrder,
            });
        }
    }

    return res.json({
        orders: orderList,
        currentPage: page,
        totalPages: totalPages,
    });
};

export const refundStatusHandle = async (req, res) => {
    const { orderIds, type } = req.body;
    console.log(type);
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
            let nextStatus = null;
            if (currentIndex == 5 && type === "accept") {
                nextStatus = status[6];
            } else if (currentIndex == 5 && type === "deny") {
                nextStatus = status[7];
            } else if (currentIndex == 7 && type === "completed") {
                nextStatus = status[8];
            }
            if (nextStatus) {
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
            } else {
                return res.status(400).json({ message: "Invalid request" });
            }
        })
    )
        .then(() => {
            res.status(200).json({ message: "Order status updated successfully" });
        })
        .catch((error) => {
            res.status(500).json({ message: "Failed to update order status", error });
        });
};
