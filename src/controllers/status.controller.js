import TrangThaiModel from "../models/trangThai.model.js";

export async function deleteStatus(req, res) {
    try {
        const { id } = req.params;
        await TrangThaiModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        return res.redirect("/admin/status");
    } catch (error) {
        console.error("Error deleting status:", error);
    }
}
export async function restoreStatus(req, res) {
    try {
        const { id } = req.params;
        await TrangThaiModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        return res.redirect("/admin/status");
    } catch (error) {
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
        return res.redirect("/admin/status");
    } catch (error) {
        console.error("Error updating status:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("admin/status/create", {
        layout: "./layouts/admin",
        page: "status",
        title: "create status",
    });
}
export async function renderUpdatePage(req, res) {
    const { id } = req.params;
    const status = await TrangThaiModel.findById(id);
    return res.render("admin/status/edit", {
        layout: "./layouts/admin",
        page: "status",
        title: "Update status",
        status: status,
    });
}
export async function createStatus(req, res) {
    try {
        const { tenTrangThai } = req.body;
        const existingStatus = await TrangThaiModel.findOne({ tenTrangThai });
        if (existingStatus) {
            return res.render("admin/status/create", {
                layout: "./layouts/admin",
                page: "Status",
                title: "create status",
                error: "Trạng thái này đã tồn tại",
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
        return res.redirect("/admin/status");
    } catch (error) {
        return res.render("admin/status/create", {
            layout: "./layouts/admin",
            page: "status",
            title: "create status",
            error: error.message,
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
        title: "status page",
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
