import mongoose from "mongoose";
import UserModel from "../models/nguoidung.model.js";
import RoleModel from "../models/vaitro.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const VIEW_OPTIONS = {
    EMPLOYEE_LIST: {
        title: "Danh sách nhân viên",
        layout: "layouts/admin",
    },
    CREATE_EMPLOYEE: {
        title: "Thêm nhân viên",
        layout: "layouts/admin",
    },
    EDIT_EMPLOYEE: {
        title: "Chỉnh sửa nhân viên",
        layout: "layouts/admin",
    },
};

export async function renderAdminEmployeePage(req, res) {
    try {
        const { page = 1 } = req.query;
        const pageSize = 10;

        const employees = await UserModel.find({ trangThaiXoa: false })
            .populate("maVaiTro")
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        const totalEmployees = await UserModel.countDocuments({ trangThaiXoa: false });

        return res.render("admin/employee/index", {
            ...VIEW_OPTIONS.EMPLOYEE_LIST,
            employees,
            currentPage: page,
            totalPages: Math.ceil(totalEmployees / pageSize),
            filters: req.query,
        });
    } catch (error) {
        return res.render("employee/index", {
            ...VIEW_OPTIONS.EMPLOYEE_LIST,
            error: error.message,
        });
    }
}

export async function renderAdminCreateEmployeePage(req, res) {
    const roles = await RoleModel.find();
    try {
        return res.render("admin/employee/create", {
            ...VIEW_OPTIONS.CREATE_EMPLOYEE,
            roles,
        });
    } catch (error) {
        return res.render("admin/employee/create", {
            title: "Thêm nhân viên",
            layout: "layouts/admin",
            error: error.message,
        });
    }
}

export async function renderAdminEditEmployeePage(req, res) {
    try {
        const { id } = req.params;
        const employee = await UserModel.findById(id).populate("maVaiTro");
        const roles = await RoleModel.find();

        return res.render("admin/employee/edit", {
            ...VIEW_OPTIONS.EDIT_EMPLOYEE,
            employee,
            roles,
        });
    } catch (error) {
        return res.render("admin/employee/edit", {
            ...VIEW_OPTIONS.EDIT_EMPLOYEE,
            error: error.message,
        });
    }
}

export async function createEmployeeHandler(req, res) {
    try {
        const { tenNguoiDung, email, matKhau, maVaiTro } = req.body;

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            throw new Error("Email đã tồn tại");
        }

        const files = req.files;
        const avatarFiles = files["anhDaiDien"];
        let avatarUrl = null;

        if (avatarFiles && avatarFiles.length > 0) {
            const thumbnailUpload = await uploadToCloudinary(avatarFiles[0], "avatars");
            avatarUrl = thumbnailUpload.url;
        }

        const newEmployee = new UserModel({
            tenNguoiDung,
            email,
            matKhau,
            anhDaiDien: avatarUrl,
            maVaiTro: new mongoose.Types.ObjectId(maVaiTro),
        });

        await newEmployee.save();

        // Update maNguoiDung
        newEmployee.maNguoiDung = newEmployee._id;
        await newEmployee.save();

        return res.redirect("/admin/employee");
    } catch (error) {
        console.log("error: ", error);
        return res.render("admin/employee/create", {
            ...VIEW_OPTIONS.CREATE_EMPLOYEE,
            error: error.message,
        });
    }
}

export async function editEmployeeHandler(req, res) {
    try {
        const { tenNguoiDung, maVaiTro, maNguoiDung } = req.body;

        const employee = await UserModel.findOne({ maNguoiDung: new mongoose.Types.ObjectId(maNguoiDung) });
        if (!employee) {
            throw new Error("Nhân viên không tồn tại");
        }

        // Xử lý hình ảnh mới nếu có
        const files = req.files;
        const avatarFiles = files["anhDaiDien"];
        let avatarUrl = employee.anhDaiDien;

        if (avatarFiles && avatarFiles.length > 0) {
            const thumbnailUpload = await uploadToCloudinary(avatarFiles[0], "avatars");
            avatarUrl = thumbnailUpload.url;
        }

        // Cập nhật dữ liệu
        employee.tenNguoiDung = tenNguoiDung;
        employee.maVaiTro = new mongoose.Types.ObjectId(maVaiTro);
        employee.anhDaiDien = avatarUrl;

        await employee.save();

        return res.redirect("/admin/employee");
    } catch (error) {
        console.log("error: ", error);
        return res.render("admin/employee/index", {
            ...VIEW_OPTIONS.EDIT_EMPLOYEE,
            error: error.message,
        });
    }
}

export async function deleteEmployeeHandler(req, res) {
    try {
        const { id } = req.params;
        const employee = await UserModel.findOne({ maNguoiDung: new mongoose.Types.ObjectId(id) });

        if (!employee) {
            throw new Error("Nhân viên không tồn tại");
        }

        employee.trangThaiXoa = true;
        await employee.save();

        return res.redirect("/admin/employee");
    } catch (error) {
        console.log("error: ", error);
        return res.redirect("/admin/employee");
    }
}
