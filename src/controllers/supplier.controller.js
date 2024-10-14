import SupplierModel from "../models/supplier.model.js";

export async function deleteSupplier(req, res) {
    try {
        const { id } = req.params;
        await SupplierModel.findByIdAndUpdate(id, { isDeleted: true });
        return res.redirect("/supplier");
    } catch (error) {
        console.error("Error deleting supplier:", error);
    }
}
export async function restoreSupplier(req, res) {
    try {
        const { id } = req.params;
        await SupplierModel.findByIdAndUpdate(id, { isDeleted: false });
        return res.redirect("/supplier");
    } catch (error) {
        console.error("Error deleting brand:", error);
    }
}
export async function updateSupplier(req, res) {
    try {
        const { id } = req.params;
        const { name, contactPerson, phone, email, address } = req.body;
        const updatedData = { name, contactPerson, phone, email, address };

        await SupplierModel.findByIdAndUpdate(id, updatedData);
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
    const supplier = await SupplierModel.findById(id);
    return res.render("supplier/edit", {
        layout: "./layouts/main",
        page: "supplier",
        title: "Update supplier",
        supplier: supplier,
    });
}
export async function createSupplier(req, res) {
    try {
        const { name, contactPerson, phone, email, address } = req.body;
        const existingSupplier = await SupplierModel.findOne({ name });
        if (existingSupplier) {
            return res.render("supplier/create", {
                layout: "./layouts/main",
                page: "Supplier",
                title: "create supplier",
                error: "Nhà cung cấp này đã tồn tại",
            });
        }
        const newSupplier = new SupplierModel({ name, contactPerson, phone, email, address });
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
        const { name, isDeleted } = req.query;
        const query = {};

        if (name) {
            query.name = { $regex: name, $options: "i" };
        }

        if (isDeleted !== undefined) {
            query.isDeleted = isDeleted === "true";
        }
        if (isDeleted === "") {
            console.log("isDeleted", isDeleted);
            query.isDeleted = { $in: [true, false] };
        }
        const { page, limit, skip } = getPagination(req);
        const suppliers = await SupplierModel.find(query).skip(skip).limit(limit);
        const totalSuppliers = await SupplierModel.countDocuments(query);

        return renderSupplierPage(res, suppliers, page, totalSuppliers);
    } catch (error) {
        console.error("Error searching supplier:", error);
    }
}

export async function renderSupplierPageWithPagination(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const suppliers = await SupplierModel.find().skip(skip).limit(limit);
        const totalSuppliers = await SupplierModel.countDocuments();

        return renderSupplierPage(res, suppliers, page, totalSuppliers);
    } catch (error) {
        console.error("Error fetching supplier:", error);
    }
}
