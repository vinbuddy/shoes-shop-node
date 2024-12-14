import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
import mongoose from "mongoose";
import env from "dotenv";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import DanhGiaModel from "../models/danhGia.model.js";
import sanPhamModel from "../models/sanPham.model.js";
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
    REVIEW_ORDER: {
        layout: "./layouts/user",
        title: "Đánh giá sản phẩm",
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
        .populate({ path: "thongTinDoiTraHang.chiTietDoiTraHang.maSanPham" })
        .populate({ path: "thongTinDoiTraHang.chiTietDoiTraHang.maKichCoSanPham" })
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
        req.flash("error", "Đơn hàng không tồn tại");
        return res.redirect("/admin/order/");
    }

    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai.toString();

    if (statusCodes === statusId) {
        req.flash("error", "Trạng thái đơn hàng không hợp lệ");
        return res.redirect("/admin/order/detail/" + orderId);
    }

    const nextStatus = status.find((s) => s._id.equals(statusId));
    if (!nextStatus) {
        req.flash("error", "Trạng thái đơn hàng không hợp lệ");
        return res.redirect("/admin/order/detail/" + orderId);
    }
    if (nextStatus.tenTrangThai === "Hoàn thành") {
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
                $set: {
                    "thongTinThanhToan.trangThaiThanhToan": "Hoàn thành",
                },
            }
        );
    } else {
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
    }

    req.flash("message", "Cập nhật trạng thái đơn hàng thành công");
    return res.redirect("/admin/order/detail/" + orderId);
};

// API
// [GET] /api/get-all-success-order/month
const getOrdersAndRevenue = async (filterCondition) => {
    try {
        const orders = await DonHangModel.find(filterCondition)
            .populate("maKhachHang")
            .populate("trangThaiDonHang.maTrangThai")
            .populate("chiTietDonHang.maSanPham")
            .populate("chiTietDonHang.maKichCoSanPham")
            .exec();

        const revenue = await DonHangModel.aggregate([
            {
                //Lọc các đơn hàng theo điều kiện truyền vào
                $match: filterCondition,
            },
            {
                // Nhóm theo ngày đặt hàng và tính tổng tiền
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$ngayDatHang" } },
                    totalAmount: { $sum: "$tongTienThanhToan" },
                },
            },
            {
                // Định dạng lại kết quả
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalAmount: 1,
                },
            },
        ]);

        return { orders, revenue };
    } catch (error) {
        console.error("Lỗi tìm nạp dữ liệu:", error);
        throw new Error("Không thể tìm nạp đơn đặt hàng và doanh thu.");
    }
};
export async function apiGetOrder(req, res) {
    const { timeType } = req.params;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const status = await TrangThaiModel.find().exec(); //Hoàn thành
    const statusCode = status[3].maTrangThai;

    let filterCondition = {};

    if (timeType === "day") {
        filterCondition = {
            ngayDatHang: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1),
            },
            trangThaiDonHang: {
                $elemMatch: {
                    maTrangThai: statusCode,
                },
            },
        };
    } else if (timeType === "week") {
    } else if (timeType === "month") {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        filterCondition = {
            ngayDatHang: {
                $gte: startDate,
                $lt: endDate,
            },
            trangThaiDonHang: {
                $elemMatch: {
                    maTrangThai: statusCode,
                },
            },
        };
    } else {
        // Year
        const startDate = new Date(new Date().getFullYear() - 10, 0, 1); // Ngày đầu năm 10 năm trước
        const endDate = new Date(new Date().getFullYear() + 1, 0, 1); // Ngày đầu năm kế tiếp (lấy hết năm hiện tại)

        filterCondition = {
            ngayDatHang: {
                $gte: startDate,
                $lt: endDate,
            },
            trangThaiDonHang: {
                $elemMatch: {
                    maTrangThai: statusCode,
                },
            },
        };
    }

    const result = await getOrdersAndRevenue(filterCondition);

    if (result) {
        return res.json({
            revenue: result.revenue,
            orders: result.orders,
        });
    } else {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng nào" });
    }
}

// [GET] /api/get-orders-today
export async function apiGetOrdersToday(req, res) {
    const date = new Date();
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const day = new Date().getDate();

    const status = await TrangThaiModel.find().exec(); //Hoàn thành
    const statusCode = status[3].maTrangThai;
    let filterCondition = {
        ngayDatHang: {
            $gte: new Date(year, month, day), // Lớn hơn hoặc bằng ngày hiện tại
            // $lt: new Date(year, month, day + 1) // Nhỏ hơn ngày hôm sau
        },
        trangThaiDonHang: {
            $elemMatch: {
                maTrangThai: statusCode,
            },
        },
    };

    const result = await getOrdersAndRevenue(filterCondition);

    if (result) {
        return res.json({
            revenue: result.revenue,
            orders: result.orders,
        });
    } else {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng nào" });
    }
}
export const cancelOrderHandle = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId);

    if (!order) {
        req.flash("error", "Đơn hàng không tồn tại");
        return res.redirect("/user/order");
    }
    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai;

    if (!status.slice(0, 2).some((s) => s.maTrangThai.toString() == statusCodes)) {
        req.flash("error", "Không thể hủy đơn hàng này");
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
    order.chiTietDonHang.forEach(async (item) => {
        const product = await sanPhamModel.findById(item.maSanPham);
        if (product) {
            const sizeIndex = product.danhSachKichCo.findIndex((size) => size.maKichCo.equals(item.maKichCoSanPham));
            if (sizeIndex !== -1) {
                product.danhSachKichCo[sizeIndex].soLuongKichCo += item.soLuongDaChon;
                await product.save();
            }
        }
    });
    req.flash("message", "Hủy đơn hàng thành công");
    return res.redirect("/user/order");
};
export const refundOrderHandle = async (req, res) => {
    const { id, reason, description, item, type, quantity, selectedItem, bank } = req.body;
    const order = await DonHangModel.findById(id).lean();

    if (!order) {
        req.flash("error", "Đơn hàng không tồn tại");
        return res.redirect("/user/order");
    }
    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai;

    if (status.findIndex((s) => s.maTrangThai.toString() == statusCodes) !== 2) {
        req.flash("error", "Không thể yêu cầu đổi trả hàng cho đơn hàng này");
        return res.redirect("/user/order");
    }
    const files = req.files;
    const reasonImageFiles = files["reasonImageFiles"];
    let uploadedFiles = [];
    if (reasonImageFiles && reasonImageFiles.length > 0) {
        const uploadPromises = reasonImageFiles.map((file) => {
            let uploadPromise = uploadToCloudinary(file, "orders");
            return uploadPromise;
        });
        uploadedFiles = await Promise.all(uploadPromises);
    }
    const sixthStatus = status[5];
    let chiTietDoiTraHang = [];
    if (type == "return") {
        for (let i = 0; i < item.length; i++) {
            if (selectedItem[i] == "checked") {
                const sanpham = order.chiTietDonHang.find((product) => {
                    return (
                        product.maSanPham.toString() == item[i] &&
                        !chiTietDoiTraHang.some(
                            (detail) =>
                                detail.maSanPham.toString() == product.maSanPham.toString() &&
                                detail.maKichCoSanPham.toString() == product.maKichCoSanPham.toString()
                        )
                    );
                });

                chiTietDoiTraHang.push({
                    maSanPham: item[i],
                    maKichCoSanPham: sanpham.maKichCoSanPham,
                    soLuongDaChon: quantity[i],
                    giaDaChon: sanpham.giaDaChon,
                });
            }
        }
        await DonHangModel.updateOne(
            { maDonHang: id },
            {
                thongTinDoiTraHang: {
                    chiTietDoiTraHang: chiTietDoiTraHang,
                    lyDoDoiTraHang: reason,
                    motaDoiTraHang: description,
                    danhSachHinhAnh: uploadedFiles.map((file) => file.url),
                    trangThaiDoi: true,
                    trangThaiDoiTra: "yêu cầu",
                    thongTinChuyenKhoan: bank,
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
    } else {
        for (let i = 0; i < item.length; i++) {
            if (selectedItem[i] == "checked") {
                const sanpham = order.chiTietDonHang.find((product) => {
                    return (
                        product.maSanPham.toString() == item[i] &&
                        !chiTietDoiTraHang.some(
                            (detail) =>
                                detail.maSanPham.toString() == product.maSanPham.toString() &&
                                detail.maKichCoSanPham.toString() == product.maKichCoSanPham.toString()
                        )
                    );
                });
                chiTietDoiTraHang.push({
                    maSanPham: item[i],
                    maKichCoSanPham: sanpham.maKichCoSanPham,
                    soLuongDaChon: quantity[i],
                    giaDaChon: sanpham.giaDaChon,
                });
            }
        }
        await DonHangModel.updateOne(
            { maDonHang: id },
            {
                thongTinDoiTraHang: {
                    chiTietDoiTraHang: chiTietDoiTraHang,
                    lyDoDoiTraHang: reason,
                    motaDoiTraHang: description,
                    danhSachHinhAnh: uploadedFiles.map((file) => file.url),
                    trangThaiTra: true,
                    trangThaiDoiTra: "yêu cầu",
                    thongTinChuyenKhoan: bank,
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
    }
    req.flash("message", "Yêu cầu đổi trả hàng thành công");
    return res.redirect("/user/order");
};
export const completedOrderHandle = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId);

    if (!order) {
        req.flash("error", "Đơn hàng không tồn tại");
        return res.redirect("/user/order");
    }
    const latestStatus = order.trangThaiDonHang[order.trangThaiDonHang.length - 1];
    const status = await TrangThaiModel.find();
    const statusCodes = latestStatus.maTrangThai;

    if (!status.slice(0, 2).some((s) => s.maTrangThai.toString() == statusCodes)) {
        req.flash("error", "Không thể hoàn thành đơn hàng này");
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
            $set: {
                "thongTinThanhToan.trangThaiThanhToan": "Hoàn thành",
            },
        }
    );
    req.flash("message", "Hoàn thành đơn hàng thành công");
    return res.redirect("/user/order");
};
export const cancelRefundHandle = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId);
    if (!order) {
        req.flash("error", "Đơn hàng không tồn tại");
        return res.redirect("/user/order");
    }
    order.trangThaiDonHang.pop();
    order.thongTinDoiTraHang = undefined;
    await order.save();
    req.flash("message", "Hủy yêu cầu đổi trả hàng thành công");
    return res.redirect("/user/order");
};
export const nextStatusRequest = async (req, res) => {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        req.flash("error", "Không có đơn hàng nào được chọn");
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
            if (!nextStatus) {
                req.flash("error", "Không thể cập nhật trạng thái cho đơn hàng này");
                return res.status(400).json({ message: "Không thể cập nhật trạng thái cho đơn hàng này" });
            }

            if (nextStatus.tenTrangThai === "Hoàn thành") {
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
                        $set: {
                            "thongTinThanhToan.trangThaiThanhToan": "Hoàn thành",
                        },
                    }
                );
            } else {
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
            }
        })
    )
        .then(() => {
            req.flash("message", "Cập nhật trạng thái đơn hàng thành công");
            res.status(200).json({ message: "Order status updated messagefully" });
        })
        .catch((error) => {
            req.flash("error", "Cập nhật trạng thái đơn hàng thất bại");
            res.status(500).json({ message: "Failed to update order status", error });
        });
};
export async function renderRefundClientPage(req, res) {
    const { id } = req.params;
    const type = req.query.type;
    const customer = req.session.customer;
    const order = await DonHangModel.findById(id)
        .populate({ path: "maKhachHang" })
        .populate({ path: "trangThaiDonHang.maTrangThai" })
        .populate({
            path: "chiTietDonHang.maSanPham",
            select: " maSanPham tenSanPham giaSanPham hinhAnhDaiDien giaDaChon soLuongDaChon",
        })
        .populate({ path: "chiTietDonHang.maKichCoSanPham", select: "tenKichCo" })
        .exec();

    return res.render("order/refund", {
        ...VIEW_OPTIONS.USER_REFUND,
        order: order,
        type: type,
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

    const orderList = [];
    for (const order of orders) {
        if (order.thongTinDoiTraHang != undefined && order.thongTinDoiTraHang._id != undefined) {
            orderList.push({
                ...order._doc,
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
    const keyword = req.query.keyword;
    let orders;
    if (mongoose.Types.ObjectId.isValid(keyword)) {
        const maDH = new mongoose.Types.ObjectId(keyword);
        orders = await DonHangModel.find({
            "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
            _id: maDH,
        })
            .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
            .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
            .sort({ "trangThaiDonHang.thoiGian": -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    } else {
        orders = await DonHangModel.find({
            "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
        })
            .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
            .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
            .sort({ "trangThaiDonHang.thoiGian": -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    let totalPages = 0;
    const orderList = [];
    for (const order of orders) {
        if (order.thongTinDoiTraHang != undefined && order.thongTinDoiTraHang._id != undefined) {
            const status = order.thongTinDoiTraHang.trangThaiDoiTra;

            if (tabId == "all-orders") {
                orderList.push({
                    ...order._doc,
                });
                const totalOrders = await DonHangModel.countDocuments({
                    "thongTinDoiTraHang.trangThaiDoiTra": { $exists: true, $ne: null },
                    "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
                });
                totalPages = Math.ceil(totalOrders / limit);
            } else if (tabId == "request-refund" && status === "yêu cầu") {
                orderList.push({
                    ...order._doc,
                });
                const totalOrders = await DonHangModel.countDocuments({
                    "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
                    "thongTinDoiTraHang.trangThaiDoiTra": "yêu cầu",
                });
                totalPages = Math.ceil(totalOrders / limit);
            } else if (tabId == "accept-refund" && status === "chấp nhận") {
                orderList.push({
                    ...order._doc,
                });
                const totalOrders = await DonHangModel.countDocuments({
                    "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
                    "thongTinDoiTraHang.trangThaiDoiTra": "chấp nhận",
                });
                totalPages = Math.ceil(totalOrders / limit);
            } else if (tabId == "deny-refund" && status === "từ chối") {
                orderList.push({
                    ...order._doc,
                });
                const totalOrders = await DonHangModel.countDocuments({
                    "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
                    "thongTinDoiTraHang.trangThaiDoiTra": "từ chối",
                });
                totalPages = Math.ceil(totalOrders / limit);
            } else if (tabId == "completed-refund" && status === "hoàn thành") {
                orderList.push({
                    ...order._doc,
                });
                const totalOrders = await DonHangModel.countDocuments({
                    "trangThaiDonHang.maTrangThai": { $exists: true, $ne: null },
                    "thongTinDoiTraHang.trangThaiDoiTra": "hoàn thành",
                });
                totalPages = Math.ceil(totalOrders / limit);
            }
        }
    }
    return res.json({
        orders: orderList,
        currentPage: page,
        totalPages: totalPages,
    });
};

export const refundStatusRequest = async (req, res) => {
    const { orderIds, type } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        req.flash("error", "Không có đơn hàng nào được chọn");
        return res.redirect("/admin/order/");
    }

    if (!orderIds) {
        return res.redirect("/admin/order/");
    }

    Promise.all(
        orderIds.map(async (orderId) => {
            let nextStatus = null;
            if (type === "accept") {
                nextStatus = "chấp nhận";
            } else if (type === "deny") {
                nextStatus = "từ chối";
            } else if (type === "completed") {
                nextStatus = "hoàn thành";
            }
            if (nextStatus) {
                await DonHangModel.findOneAndUpdate(
                    { maDonHang: orderId },
                    {
                        $set: {
                            "thongTinDoiTraHang.trangThaiDoiTra": nextStatus,
                        },
                    }
                );
                if (type === "completed") {
                    const order = await DonHangModel.findOneAndUpdate(
                        { maDonHang: orderId },
                        {
                            $set: {
                                "thongTinThanhToan.trangThaiHoanTien": "Hoàn thành",
                            },
                        }
                    );
                    order.thongTinDoiTraHang.chiTietDoiTraHang.forEach(async (item) => {
                        const product = await sanPhamModel.findById(item.maSanPham);
                        if (product) {
                            const sizeIndex = product.danhSachKichCo.findIndex((size) =>
                                size.maKichCo.equals(item.maKichCoSanPham)
                            );
                            if (sizeIndex !== -1) {
                                product.danhSachKichCo[sizeIndex].soLuongKichCo += item.soLuongDaChon;
                                await product.save();
                            }
                        }
                    });
                }
            } else {
                req.flash("error", "Trạng thái đổi trả hàng không hợp lệ");
                return res.status(400).json({ message: "Trạng thái đổi trả hàng không hợp lệ" });
            }
        })
    )
        .then(() => {
            req.flash("message", "Cập nhật trạng thái đổi trả hàng thành công");
            res.status(200).json({ message: "Cập nhật trạng thái đổi trả hàng thành công" });
        })
        .catch((error) => {
            req.flash("error", "Cập nhật trạng thái đổi trả hàng thất bại");
            res.status(500).json({ message: "Cập nhật trạng thái đổi trả hàng thất bại", error });
        });
};

export async function renderUserOrderReviewPage(req, res) {
    const { id } = req.params;
    const type = req.query.type;
    const customer = req.session.customer;
    const order = await DonHangModel.findById(id)
        .populate({ path: "maKhachHang" })
        .populate({ path: "trangThaiDonHang.maTrangThai" })
        .populate({
            path: "chiTietDonHang.maSanPham",
            select: " maSanPham tenSanPham giaSanPham hinhAnhDaiDien giaDaChon soLuongDaChon",
        })
        .populate({ path: "chiTietDonHang.maKichCoSanPham", select: "tenKichCo" })
        .exec();

    return res.render("order/review", {
        ...VIEW_OPTIONS.REVIEW_ORDER,
        order: order,
        type: type,
        customer: customer,
    });
}

export const nextStatusHandler = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await DonHangModel.findById(orderId);

    if (!order) {
        req.flash("error", "Đơn hàng không tồn tại");
        return res.redirect("/admin/order/");
    }

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
    req.flash("message", "Cập nhật trạng thái đơn hàng thành công");
    return res.redirect("/admin/order/");
};
export async function SearchOrders(req, res) {
    const { keyword } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    if (!mongoose.Types.ObjectId.isValid(keyword)) {
        req.flash("error", "Mã đơn hàng không hợp lệ");
        return res.redirect("/admin/order");
    }
    const maDH = new mongoose.Types.ObjectId(keyword);
    const orders = await DonHangModel.find(maDH)
        .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
        .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
        .sort({ "trangThaiDonHang.thoiGian": -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    const status = await TrangThaiModel.find();
    const totalOrders = await DonHangModel.countDocuments(maDH);
    const searchStatus = req.query.status;

    const totalPages = Math.ceil(totalOrders / limit);
    return res.render("admin/order", {
        ...VIEW_OPTIONS.ADMIN_LIST,
        orders: orders,
        statuses: status,
        currentPage: page,
        totalPages: totalPages,
        filters: req.query,
        searchKeyword: keyword,
        searchStatus: searchStatus,
    });
}

export async function reviewOrderHandler(req, res) {
    try {
        const { orderId, item, rating, message } = req.body;

        for (let i = 0; i < item.length; i++) {
            const newReview = new DanhGiaModel({
                maSanPham: item[i],
                maDonHang: new mongoose.Types.ObjectId(orderId),
                maKhachHang: new mongoose.Types.ObjectId(req.session.customer._id),
                soDiem: rating[i],
                noiDungDanhGia: message[i],
            });
            await newReview.save();
        }
        req.flash("message", "Đánh giá sản phẩm thành công");
        return res.redirect("/user/order");
    } catch (error) {
        req.flash("error", "Đánh giá sản phẩm thất bại", error);
        return res.redirect("/user/order");
    }
}
