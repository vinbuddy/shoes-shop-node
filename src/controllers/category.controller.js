import DanhMucModel from "../models/danhMuc.model.js";

export async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        await DanhMucModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        req.flash("message", "Xóa danh mục thành công");
        return res.redirect("/admin/category");
    } catch (error) {
        req.flash("error", "Xóa danh mục thất bại");
        console.error("Error deleting category:", error);
        res.redirect("/admin/category");
    }
}

export async function restoreCategory(req, res) {
    try {
        const { id } = req.params;
        await DanhMucModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        req.flash("message", "Khôi phục danh mục thành công");
        return res.redirect("/admin/category");
    } catch (error) {
        req.flash("error", "Khôi phục danh mục thất bại");
        console.error("Error restoring category:", error);
        return res.redirect("/admin/category");
    }
}

export async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { tenDanhMuc, moTa } = req.body;
        const updatedData = { tenDanhMuc, moTa };

        await DanhMucModel.findByIdAndUpdate(id, updatedData);
        req.flash("message", "Cập nhật danh mục thành công");
        return res.redirect("/admin/category");
    } catch (error) {
        req.flash("error", "Cập nhật danh mục thất bại");
        console.error("Error updating category:", error);
        return res.redirect("/admin/category");
    }
}

export function renderCreateCategoryPage(req, res) {
    return res.render("admin/category/create", {
        layout: "./layouts/admin",
        page: "category",
        title: "Tạo danh mục",
    });
}

export async function renderUpdateCategoryPage(req, res) {
    const { id } = req.params;
    const category = await DanhMucModel.findById(id);
    return res.render("admin/category/edit", {
        layout: "./layouts/admin",
        page: "category",
        title: "Cập nhật danh mục",
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
                title: "Tạo danh mục",
                error: "Danh mục này đã tồn tại",
            });
        }
        const newCategory = new DanhMucModel({ tenDanhMuc, moTa });
        await newCategory.save();
        await DanhMucModel.updateOne(
            { _id: newCategory._id },
            {
                $set: {
                    maDanhMuc: newCategory._id,
                },
            }
        );

        req.flash("message", "Tạo danh mục thành công");
        return res.redirect("/admin/category");
    } catch (error) {
        req.flash("error", "Tạo danh mục thất bại");
        console.error("Error creating category:", error);
        return res.redirect("/admin/category/create");
    }
}

const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const renderCategoryPage = async (res, categories, page, totalCategories) => {
    return res.render("admin/category/index", {
        layout: "./layouts/admin",
        page: "category",
        title: "Danh sách danh mục",
        categories: categories,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / 10),
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
        req.flash("error", "Tìm kiếm danh mục thất bại");
        console.error("Error searching category:", error);
        res.redirect("/admin/category");
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
