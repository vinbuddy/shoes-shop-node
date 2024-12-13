import TrangThaiModel from "../models/trangThai.model.js";

export async function deleteStatus(req, res) {
    try {
        const { id } = req.params;
        await TrangThaiModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        req.flash("message", "Xóa trạng thái thành công");
        return res.redirect("/admin/status");
    } catch (error) {
        req.flash("error", "Xóa trạng thái thất bại");
        console.error("Error deleting status:", error);
    }
}
export async function restoreStatus(req, res) {
    try {
        const { id } = req.params;
        await TrangThaiModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        req.flash("message", "Khôi phục trạng thái thành công");
        return res.redirect("/admin/status");
    } catch (error) {
        req.flash("error", "Khôi phục trạng thái thất bại");
        console.error("Error deleting status:", error);
    }
}
export async function updateStatus(req, res) {
    try {
        const id = req.body.id;
        const { tenTrangThai } = req.body;
        const updatedData = { tenTrangThai };
        console.log(updatedData);
        await TrangThaiModel.findByIdAndUpdate(id, updatedData);
        req.flash("message", "Cập nhật trạng thái thành công");
        return res.redirect("/admin/status");
    } catch (error) {
        req.flash("error", "Cập nhật trạng thái thất bại");
        console.error("Error updating status:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("admin/status/create", {
        layout: "./layouts/admin",
        page: "status",
        title: "Tạo trạng thái",
    });
}
export async function renderUpdatePage(req, res) {
    const { id } = req.params;
    const status = await TrangThaiModel.findById(id);
    return res.render("admin/status/edit", {
        layout: "./layouts/admin",
        page: "status",
        title: "Cập nhật trạng thái",
        status: status,
    });
}
export async function createStatus(req, res) {
    try {
        const { tenTrangThai } = req.body;
        const existingStatus = await TrangThaiModel.findOne({ tenTrangThai });
        if (existingStatus) {
            req.flash("error", "Trạng thái này đã tồn tại");
            return res.render("admin/status/create", {
                layout: "./layouts/admin",
                page: "Status",
                title: "create status",
            });
        }
        const newStatus = new TrangThaiModel({ tenTrangThai });
        await newStatus.save();
        await TrangThaiModel.updateOne(
            { _id: newStatus._id },
            {
                $set: {
                    maTrangThai: newStatus._id,
                },
            }
        );
        req.flash("message", "Thêm trạng thái thành công");
        return res.redirect("/admin/status");
    } catch (error) {
        req.flash("error", "Thêm trạng thái thất bại", error);
        return res.render("admin/status/create", {
            layout: "./layouts/admin",
            page: "status",
            title: "Tạo trạng thái",
        });
    }
}

const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const renderStatusPage = async (res, statuss, page, totalStatuss) => {
    return res.render("admin/status/index", {
        layout: "./layouts/admin",
        page: "status",
        title: "Danh sách trạng thái",
        statuss: statuss,
        currentPage: page,
        totalPages: Math.ceil(totalStatuss / 10),
    });
};

export async function searchStatus(req, res) {
    try {
        const { tenNhaCungCap, trangThaiXoa } = req.query;
        const query = {};

        if (tenNhaCungCap) {
            query.tenNhaCungCap = { $regex: tenNhaCungCap, $options: "i" };
        }

        if (trangThaiXoa !== undefined) {
            query.trangThaiXoa = trangThaiXoa === "true";
        }
        if (trangThaiXoa === "") {
            query.trangThaiXoa = { $in: [true, false] };
        }
        const { page, limit, skip } = getPagination(req);
        const statuss = await TrangThaiModel.find(query).skip(skip).limit(limit);
        const totalStatuss = await TrangThaiModel.countDocuments(query);

        return renderStatusPage(res, statuss, page, totalStatuss);
    } catch (error) {
        console.error("Error searching status:", error);
    }
}

export async function renderStatusPageWithPagination(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const statuss = await TrangThaiModel.find().skip(skip).limit(limit);
        const totalStatuss = await TrangThaiModel.countDocuments();

        return renderStatusPage(res, statuss, page, totalStatuss);
    } catch (error) {
        console.error("Error fetching status:", error);
    }
}
