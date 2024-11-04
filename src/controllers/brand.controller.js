import BrandModel from "../models/hangSanXuat.model.js";

export async function deleteBrand(req, res) {
    try {
        const { id } = req.params;
        await BrandModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        return res.redirect("/admin/brand");
    } catch (error) {
        console.error("Error deleting brand:", error);
    }
}
export async function restoreBrand(req, res) {
    try {
        const { id } = req.params;
        await BrandModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        return res.redirect("/admin/brand");
    } catch (error) {
        console.error("Error deleting brand:", error);
    }
}

export async function updateBrand(req, res) {
    try {
        const id = req.body.id;
        const { tenHangSanXuat, moTa } = req.body;
        const existingBrand = await BrandModel.findOne({ tenHangSanXuat, _id: { $ne: id } });

        if (existingBrand) {
            return res.redirect("/admin/brand");
        }

        const updatedData = { tenHangSanXuat, moTa };
        await BrandModel.findByIdAndUpdate(id, updatedData);
        const brands = await BrandModel.find();
        return res.render("admin/brand/index", {
            layout: "./layouts/admin",
            page: "brand",
            title: "brand page",
            brands: brands,
            error: "Nhãn hàng này đã tồn tại",
        });
    } catch (error) {
        console.error("Error updating brand:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("admin/brand/create", {
        layout: "./layouts/admin",
        page: "brand",
        title: "create brand",
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
                title: "create brand",
                error: "Nhãn hàng này đã tồn tại",
            });
        }
        const newBrand = new BrandModel({ tenHangSanXuat, moTa });
        await newBrand.save();
        return res.redirect("/admin/brand");
    } catch (error) {
        return res.render("admin/brand/create", {
            layout: "./layouts/admin",
            page: "brand",
            title: "create brand",
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

const renderBrandPage = async (res, brands, page, totalBrands) => {
    return res.render("admin/brand/index", {
        layout: "./layouts/admin",
        page: "brand",
        title: "brand page",
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
