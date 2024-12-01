import SizeModel from "../models/kichCo.model.js";
import KichCoModel from "../models/kichCo.model.js";

export async function deleteSize(req, res) {
    try {
        const { id } = req.params;
        await SizeModel.findByIdAndUpdate(id, { trangThaiXoa: true });
        return res.redirect("/admin/size");
    } catch (error) {
        console.error("Error deleting size:", error);
    }
}
export async function restoreSize(req, res) {
    try {
        const { id } = req.params;
        await SizeModel.findByIdAndUpdate(id, { trangThaiXoa: false });
        return res.redirect("/admin/size");
    } catch (error) {
        console.error("Error deleting size:", error);
    }
}

export async function updateSize(req, res) {
    try {
        const id = req.body.id;
        const { tenKichCo, moTaKichCo } = req.body;
        const existingSize = await SizeModel.findOne({ tenKichCo, _id: { $ne: id } });
        if (existingSize) {
            return res.redirect("/admin/size");
        }
        const totalSizes = await SizeModel.countDocuments();
        const updatedData = { tenKichCo, moTaKichCo };
        await SizeModel.findByIdAndUpdate(id, updatedData);
        const sizes = await SizeModel.find();
        req.flash("message", "Sửa kích cỡ thành công");
        return res.render("admin/size/index", {
            layout: "./layouts/admin",
            page: "size",
            title: "size page",
            sizes: sizes,
            currentPage: 1,
            totalPages: Math.ceil(totalSizes / 10),
        });
    } catch (error) {
        req.flash("error", "Sửa kích cỡ thất bại");
        console.error("Error updating size:", error);
    }
}
export function renderCreatePage(req, res) {
    return res.render("admin/size/create", {
        layout: "./layouts/admin",
        page: "size",
        title: "create size",
    });
}

export async function createSize(req, res) {
    try {
        const { tenKichCo, moTaKichCo } = req.body;
        const existingSize = await SizeModel.findOne({ tenKichCo });

        if (existingSize) {
            throw new Error("Kích cỡ đã tồn tại");
        }
        const newSize = new SizeModel({ tenKichCo, moTaKichCo });

        await newSize.save();
        await SizeModel.updateOne(
            { _id: newSize._id },
            {
                $set: {
                    maHangSanXuat: newSize._id,
                },
            }
        );
        req.flash("message", "Thêm kích cỡ thành công");
        return res.redirect("/admin/size");
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/admin/size/create");
    }
}

const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const renderSizePage = async (res, sizes, page, totalSizes) => {
    return res.render("admin/size/index", {
        layout: "./layouts/admin",
        page: "size",
        title: "size page",
        sizes: sizes,
        currentPage: page,
        totalPages: Math.ceil(totalSizes / 10),
    });
};

export async function searchSize(req, res) {
    try {
        const { tenKichCo, trangThaiXoa } = req.query;
        const query = {};

        if (tenKichCo) {
            query.tenKichCo = { $regex: tenKichCo, $options: "i" };
        }

        if (trangThaiXoa !== undefined) {
            query.trangThaiXoa = trangThaiXoa === "true";
        }
        if (trangThaiXoa === "") {
            query.trangThaiXoa = { $in: [true, false] };
        }
        const { page, limit, skip } = getPagination(req);
        const sizes = await SizeModel.find(query).skip(skip).limit(limit);
        const totalSizes = await SizeModel.countDocuments(query);

        return renderSizePage(res, sizes, page, totalSizes);
    } catch (error) {
        console.error("Error searching size:", error);
    }
}

export async function renderSizePageWithPagination(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const sizes = await SizeModel.find().skip(skip).limit(limit);
        const totalSizes = await SizeModel.countDocuments();

        return renderSizePage(res, sizes, page, totalSizes);
    } catch (error) {
        console.error("Error fetching size:", error);
    }
}

// API

// Get All Size Information
// [GET] /api/size/
export async function getAllSize(req, res) {
    const sizes = await SizeModel.find({}).select();

    if (sizes) {
        return res.json(sizes);
    } else {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
}

// [POST] /api/addSize
export async function addSize(req, res) {
    const { tenKichCo, moTaKichCo } = req.body;

    if (!tenKichCo) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    const size = new KichCoModel({
        tenKichCo: tenKichCo,
        moTaKichCo: moTaKichCo,
        trangThaiXoa: false
    });

    const savedSize = await size.save();
    savedSize.maKichCo = savedSize._id;

    await savedSize.save();

    return res.status(200).json({
        message: "Dữ liệu đã lưu thành công.",
        size: savedSize,
    });
}
