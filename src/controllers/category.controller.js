import DanhMucModel from "../models/danhMuc.model.js";

export async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        await DanhMucModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        return res.redirect("/admin/category");
    } catch (error) {
        console.error("Error deleting category:", error);
    }
}

export async function restoreCategory(req, res) {
    try {
        const { id } = req.params;
        await DanhMucModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        return res.redirect("/admin/category");
    } catch (error) {
        console.error("Error restoring category:", error);
    }
}

export async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { tenDanhMuc, moTa } = req.body;
        const updatedData = { tenDanhMuc, moTa };

        await DanhMucModel.findByIdAndUpdate(id, updatedData);
        return res.redirect("/admin/category");
    } catch (error) {
        console.error("Error updating category:", error);
    }
}

export function renderCreateCategoryPage(req, res) {
    return res.render("admin/category/create", {
        layout: "./layouts/admin",
        page: "category",
        title: "Create Category",
    });
}

export async function renderUpdateCategoryPage(req, res) {
    const { id } = req.params;
    const category = await DanhMucModel.findById(id);
    return res.render("admin/category/edit", {
        layout: "./layouts/admin",
        page: "category",
        title: "Update Category",
        category: category,
    });
}

export async function createCategory(req, res) {
    try {
        const { tenDanhMuc, moTa } = req.body;
        const existingCategory = await DanhMucModel.findOne({ tenDanhMuc });
        if (existingCategory) {
            return res.render("admin/category/create", {
                layout: "./layouts/admin",
                page: "category",
                title: "Create Category",
                error: "Danh mục này đã tồn tại",
            });
        }
        const newCategory = new DanhMucModel({ tenDanhMuc, moTa });
        await newCategory.save();
        return res.redirect("/admin/category");
    } catch (error) {
        return res.render("admin/category/create", {
            layout: "./layouts/admin",
            page: "category",
            title: "Create Category",
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

const renderCategoryPage = async (res, categories, page, totalCategories) => {
    return res.render("admin/category/index", {
        layout: "./layouts/admin",
        page: "category",
        title: "Category Page",
        categories: categories,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / 3),
    });
};

export async function searchCategory(req, res) {
    try {
        const { tenDanhMuc, trangThaiXoa } = req.query;
        const query = {};

        if (tenDanhMuc) {
            query.tenDanhMuc = { $regex: tenDanhMuc, $options: "i" };
        }

        if (trangThaiXoa !== undefined) {
            query.trangThaiXoa = trangThaiXoa === "true";
        }
        if (trangThaiXoa === "") {
            console.log("trangThaiXoa", trangThaiXoa);
            query.trangThaiXoa = { $in: [true, false] };
        }
        const { page, limit, skip } = getPagination(req);
        const categories = await DanhMucModel.find(query).skip(skip).limit(limit);
        const totalCategories = await DanhMucModel.countDocuments(query);

        return renderCategoryPage(res, categories, page, totalCategories);
    } catch (error) {
        console.error("Error searching category:", error);
    }
}

export async function renderCategoryPageWithPagination(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const categories = await DanhMucModel.find().skip(skip).limit(limit);
        const totalCategories = await DanhMucModel.countDocuments();

        return renderCategoryPage(res, categories, page, totalCategories);
    } catch (error) {
        console.error("Error fetching category:", error);
    }
}
