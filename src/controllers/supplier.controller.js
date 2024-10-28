import NhaSanXuatModel from "../models/nhaCungCap.model.js";

export async function deleteSupplier(req, res) {
    try {
        const { id } = req.params;
        await NhaSanXuatModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        return res.redirect("/supplier");
    } catch (error) {
        console.error("Error deleting supplier:", error);
    }
}
export async function restoreSupplier(req, res) {
    try {
        const { id } = req.params;
        await NhaSanXuatModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        return res.redirect("/supplier");
    } catch (error) {
        console.error("Error deleting brand:", error);
    }
}
export async function updateSupplier(req, res) {
    try {
        const { id } = req.params;
        const { tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi } = req.body;
        const updatedData = { tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi };

        await NhaSanXuatModel.findByIdAndUpdate(id, updatedData);
        return res.redirect("/supplier");
    } catch (error) {
        console.error("Error updating supplier:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("supplier/create", {
        layout: "./layouts/main",
        page: "supplier",
        title: "create supplier",
    });
}
export async function renderUpdatePage(req, res) {
    const { id } = req.params;
    const supplier = await NhaSanXuatModel.findById(id);
    console.log(supplier);
    return res.render("supplier/edit", {
        layout: "./layouts/main",
        page: "supplier",
        title: "Update supplier",
        supplier: supplier,
    });
}
export async function createSupplier(req, res) {
    try {
        const { tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi } = req.body;
        const existingSupplier = await NhaSanXuatModel.findOne({ tenNhaCungCap });
        if (existingSupplier) {
            return res.render("supplier/create", {
                layout: "./layouts/main",
                page: "Supplier",
                title: "create supplier",
                error: "Nhà cung cấp này đã tồn tại",
            });
        }
        const newSupplier = new NhaSanXuatModel({ tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi });
        await newSupplier.save();
        return res.redirect("/supplier");
    } catch (error) {
        return res.render("supplier/create", {
            layout: "./layouts/main",
            page: "supplier",
            title: "create supplier",
            error: error.message,
        });
    }
}

const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const renderSupplierPage = async (res, suppliers, page, totalSuppliers) => {
    return res.render("supplier/index", {
        layout: "./layouts/main",
        page: "supplier",
        title: "supplier page",
        suppliers: suppliers,
        currentPage: page,
        totalPages: Math.ceil(totalSuppliers / 3),
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
            console.log("trangThaiXoa", trangThaiXoa);
            query.trangThaiXoa = { $in: [true, false] };
        }
        const { page, limit, skip } = getPagination(req);
        const suppliers = await NhaSanXuatModel.find(query).skip(skip).limit(limit);
        const totalSuppliers = await NhaSanXuatModel.countDocuments(query);

        return renderSupplierPage(res, suppliers, page, totalSuppliers);
    } catch (error) {
        console.error("Error searching supplier:", error);
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
