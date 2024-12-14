import BrandModel from "../models/hangSanXuat.model.js";

export async function deleteBrand(req, res) {
    try {
        const { id } = req.params;
        await BrandModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        req.flash("message", "Xóa nhãn hàng thành công");
        return res.redirect("/admin/brand");
    } catch (error) {
        req.flash("error", "Xóa nhãn hàng thất bại");
        console.error("Error deleting brand:", error);
    }
}
export async function restoreBrand(req, res) {
    try {
        const { id } = req.params;
        await BrandModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        req.flash("message", "Khôi phục nhãn hàng thành công");
        return res.redirect("/admin/brand");
    } catch (error) {
        req.flash("error", "Khôi phục nhãn hàng thất bại");
        console.error("Error deleting brand:", error);
    }
}

export async function updateBrand(req, res) {
    try {
        const id = req.body.id;
        const { tenHangSanXuat, moTa } = req.body;
        const existingBrand = await BrandModel.findOne({ tenHangSanXuat, _id: { $ne: id } });
        if (existingBrand) {
            req.flash("error", "Nhãn hàng này đã tồn tại");
            return res.redirect("/admin/brand");
        }
        const updatedData = { tenHangSanXuat, moTa };
        await BrandModel.findByIdAndUpdate(id, updatedData);
        req.flash("message", "Cập nhật nhãn hàng thành công");
        return res.redirect("/admin/brand");
    } catch (error) {
        req.flash("error", "Cập nhật nhãn hàng thất bại");
        console.error("Error updating brand:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("admin/brand/create", {
        layout: "./layouts/admin",
        page: "brand",
        title: "Tạo nhãn hàng",
    });
}

export async function createBrand(req, res) {
    try {
        const { tenHangSanXuat, moTa } = req.body;
        const existingBrand = await BrandModel.findOne({ tenHangSanXuat });
        if (existingBrand) {
            return res.render("admin/brand/create", {
                layout: "./layouts/admin",
                page: "brand",
                title: "Tạo nhãn hàng",
                error: "Nhãn hàng này đã tồn tại",
            });
        }
        const newBrand = new BrandModel({ tenHangSanXuat, moTa });

        await newBrand.save();
        await BrandModel.updateOne(
            { _id: newBrand._id },
            {
                $set: {
                    maHangSanXuat: newBrand._id,
                },
            }
        );
        req.flash("message", "Tạo nhãn hàng thành công");
        return res.redirect("/admin/brand");
    } catch (error) {
        req.flash("error", error.message);
        return res.render("admin/brand/create", {
            layout: "./layouts/admin",
            page: "brand",
            title: "Tạo nhãn hàng",
        });
    }
}

const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const renderBrandPage = async (res, brands, page, totalBrands) => {
    return res.render("admin/brand/index", {
        layout: "./layouts/admin",
        page: "brand",
        title: "Danh sách nhãn hàng",
        brands: brands,
        currentPage: page,
        totalPages: Math.ceil(totalBrands / 10),
    });
};

export async function searchBrand(req, res) {
    try {
        const { tenHangSanXuat, trangThaiXoa } = req.query;
        const query = {};

        if (tenHangSanXuat) {
            query.tenHangSanXuat = { $regex: tenHangSanXuat, $options: "i" };
        }

        if (trangThaiXoa !== undefined) {
            query.trangThaiXoa = trangThaiXoa === "true";
        }
        if (trangThaiXoa === "") {
            query.trangThaiXoa = { $in: [true, false] };
        }
        const { page, limit, skip } = getPagination(req);
        const brands = await BrandModel.find(query).skip(skip).limit(limit);
        const totalBrands = await BrandModel.countDocuments(query);

        return renderBrandPage(res, brands, page, totalBrands);
    } catch (error) {
        console.error("Error searching brand:", error);
    }
}

export async function renderBrandPageWithPagination(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const brands = await BrandModel.find().skip(skip).limit(limit);
        const totalBrands = await BrandModel.countDocuments();

        return renderBrandPage(res, brands, page, totalBrands);
    } catch (error) {
        console.error("Error fetching brand:", error);
    }
}
