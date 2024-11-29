import DonHangModel from "../models/donHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
// import mongoose from "mongoose";
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

export const renderAdminOrderPage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const orders = await DonHangModel.find()
        .populate({ path: "maKhachHang", select: "tenKhachHang anhDaiDien" })
        .populate({ path: "trangThaiDonHang.maTrangThai", select: "tenTrangThai" })
        .skip(skip)
        .limit(limit)
        .exec();

    const totalOrders = await DonHangModel.countDocuments();
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
                $match: filterCondition
            },
            {
                // Nhóm theo ngày đặt hàng và tính tổng tiền
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$ngayDatHang" } },
                    totalAmount: { $sum: "$tongTienThanhToan" }
                }
                },
            {
                // Định dạng lại kết quả
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalAmount: 1
                }
            },
        ]);

        return { orders, revenue };
    } catch (error) {
        console.error('Lỗi tìm nạp dữ liệu:', error);
        throw new Error('Không thể tìm nạp đơn đặt hàng và doanh thu.');
    }
}
export async function apiGetOrder(req, res) {
    const {
        timeType,
    } = req.params;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    const status = await TrangThaiModel.find().exec(); //Hoàn thành
    const statusCode = status[3].maTrangThai;

    let filterCondition = {}

    if (timeType === 'day') {
        filterCondition = {
            ngayDatHang: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            },
            "trangThaiDonHang": {
                $elemMatch: {
                    "maTrangThai": statusCode
                }
            }
        };
    }
    else if (timeType === 'week') {
        
    }
    else if (timeType === 'month') {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1); 

        filterCondition = {
            ngayDatHang: {
                $gte: startDate, 
                $lt: endDate
            },
            "trangThaiDonHang": {
                $elemMatch: {
                    "maTrangThai": statusCode
                }
            }
        };
    }
    else {
        // Year
        const startDate = new Date(new Date().getFullYear() - 10, 0, 1); // Ngày đầu năm 10 năm trước
        const endDate = new Date(new Date().getFullYear() + 1, 0, 1); // Ngày đầu năm kế tiếp (lấy hết năm hiện tại)

        filterCondition = {
            ngayDatHang: {
                $gte: startDate, 
                $lt: endDate
            },
            "trangThaiDonHang": {
                $elemMatch: {
                    "maTrangThai": statusCode
                }
            }
        };
    }
    
    const result = await getOrdersAndRevenue(filterCondition);
    
    if (result) {
        return res.json({
            revenue: result.revenue,
            orders: result.orders
        });
    } else {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng nào' });
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
        "trangThaiDonHang": {
            $elemMatch: {
                "maTrangThai": statusCode
            }
        }
    };

    const result = await getOrdersAndRevenue(filterCondition);

    if (result) {
        return res.json({
            revenue: result.revenue,
            orders: result.orders
        });
    } else {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng nào' });
    }
}