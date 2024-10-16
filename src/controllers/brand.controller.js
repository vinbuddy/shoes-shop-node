import BrandModel from "../models/kichCo.model.js";

export async function renderBrandPage(req, res) {
    try {
        const brands = await BrandModel.find();
        return res.render("brand/index", {
            layout: "./layouts/main",
            page: "brand",
            title: "brand page",
            brands: brands,
        });
    } catch (error) {
        console.error("Error fetching brands:", error);
    }
}

export async function deleteBrand(req, res) {
    try {
        const { id } = req.params;
        await BrandModel.findByIdAndUpdate(id, { isDeleted: true });
        return res.redirect("/brand");
    } catch (error) {
        console.error("Error deleting brand:", error);
    }
}
export async function restoreBrand(req, res) {
    try {
        const { id } = req.params;
        await BrandModel.findByIdAndUpdate(id, { isDeleted: false });
        return res.redirect("/brand");
    } catch (error) {
        console.error("Error deleting brand:", error);
    }
}

export async function updateBrand(req, res) {
    try {
        const id = req.body.id;
        const { name, description } = req.body;
        const existingBrand = await BrandModel.findOne({ name, _id: { $ne: id } });

        if (existingBrand) {
            return res.redirect("/brand");
        }

        const updatedData = { name, description };
        await BrandModel.findByIdAndUpdate(id, updatedData);
        const brands = await BrandModel.find();
        return res.render("brand/index", {
            layout: "./layouts/main",
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
    return res.render("brand/create", {
        layout: "./layouts/main",
        page: "brand",
        title: "create brand",
    });
}

export async function createBrand(req, res) {
    try {
        const { name, description } = req.body;
        const existingBrand = await BrandModel.findOne({ name });
        if (existingBrand) {
            return res.render("brand/create", {
                layout: "./layouts/main",
                page: "brand",
                title: "create brand",
                error: "Nhãn hàng này đã tồn tại",
            });
        }
        const newBrand = new BrandModel({ name, description });
        await newBrand.save();
        return res.redirect("/brand");
    } catch (error) {
        return res.render("brand/create", {
            layout: "./layouts/main",
            page: "brand",
            title: "create brand",
            error: error.message,
        });
    }
}
