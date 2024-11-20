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
