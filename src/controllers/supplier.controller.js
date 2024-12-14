import NhaSanXuatModel from "../models/nhaCungCap.model.js";

export async function deleteSupplier(req, res) {
    try {
        const { id } = req.params;
        await NhaSanXuatModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        req.flash("message", "Xóa nhà cung cấp thành công");
        return res.redirect("/admin/supplier");
    } catch (error) {
        req.flash("error", "Xóa nhà cung cấp thất bại");
        console.error("Error deleting supplier:", error);
    }
}
export async function restoreSupplier(req, res) {
    try {
        const { id } = req.params;
        await NhaSanXuatModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        req.flash("message", "Khôi phục nhà cung cấp thành công");
        return res.redirect("/admin/supplier");
    } catch (error) {
        req.flash("error", "Khôi phục nhà cung cấp thất bại");
        console.error("Error deleting brand:", error);
    }
}
export async function updateSupplier(req, res) {
    try {
        const { id } = req.params;
        const { tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi } = req.body;
        const updatedData = { tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi };

        await NhaSanXuatModel.findByIdAndUpdate(id, updatedData);
        req.flash("message", "Cập nhật nhà cung cấp thành công");
        return res.redirect("/admin/supplier");
    } catch (error) {
        req.flash("error", "Cập nhật nhà cung cấp thất bại");
        console.error("Error updating supplier:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("admin/supplier/create", {
        layout: "./layouts/admin",
        page: "supplier",
        title: "Tạo nhà cung cấp",
    });
}
export async function renderUpdatePage(req, res) {
    const { id } = req.params;
    const supplier = await NhaSanXuatModel.findById(id);
    return res.render("admin/supplier/edit", {
        layout: "./layouts/admin",
        page: "supplier",
        title: "Cập nhật nhà cung cấp",
        supplier: supplier,
    });
}
export async function createSupplier(req, res) {
    try {
        const { tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi } = req.body;
        const existingSupplier = await NhaSanXuatModel.findOne({ tenNhaCungCap });
        if (existingSupplier) {
            req.flash("error", "Nhà cung cấp này đã tồn tại");
            return res.redirect("admin/supplier/create");
        }
        const newSupplier = new NhaSanXuatModel({ tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi });
        await newSupplier.save();

        await NhaSanXuatModel.updateOne(
            { _id: newSupplier._id },
            {
                $set: {
                    maNhaCungCap: newSupplier._id,
                },
            }
        );
        req.flash("message", "Thêm nhà cung cấp thành công");
        return res.redirect("/admin/supplier");
    } catch (error) {
        req.flash("error", "Thêm nhà cung cấp thất bại");
        console.error("Error creating supplier:", error);
        return res.render("admin/supplier/create", {
            layout: "./layouts/admin",
            page: "supplier",
            title: "Tạo nhà cung cấp",
        });
    }
}

const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const renderSupplierPage = async (res, suppliers, page, totalSuppliers) => {
    return res.render("admin/supplier/index", {
        layout: "./layouts/admin",
        page: "supplier",
        title: "Danh sách nhà cung cấp",
        suppliers: suppliers,
        currentPage: page,
        totalPages: Math.ceil(totalSuppliers / 10),
    });
};

export async function searchSupplier(req, res) {
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
        const suppliers = await NhaSanXuatModel.find(query).skip(skip).limit(limit);
        const totalSuppliers = await NhaSanXuatModel.countDocuments(query);

        return renderSupplierPage(res, suppliers, page, totalSuppliers);
    } catch (error) {
        req.flash("error", error.message);
    }
}

export async function renderSupplierPageWithPagination(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const suppliers = await NhaSanXuatModel.find().skip(skip).limit(limit);
        const totalSuppliers = await NhaSanXuatModel.countDocuments();

        return renderSupplierPage(res, suppliers, page, totalSuppliers);
    } catch (error) {
        console.error("Error fetching supplier:", error);
    }
}

// API

// Get Supplier Information By Id
// [GET] /api/supplier/:id
export async function getSupplierById(req, res) {
    // Get supplier id from request params
    const supplierId = req.params.id;
    const supplier = await NhaSanXuatModel.findById(supplierId);

    if (supplier) {
        return res.json(supplier);
    } else {
        return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });
    }
}
