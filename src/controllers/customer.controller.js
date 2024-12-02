import KhachHangModel from "../models/khachHang.model.js";

export async function renderAdminCustomerPage(req, res, next) {
    const user = req.session.user;
    const customers = await KhachHangModel.find().exec();
    return res.render("admin/customer/customers", {
        layout: "./layouts/admin",
        page: "customers",
        title: "Quản lý khách hàng",
        user,
        customers,
    });
}

export async function searchCustomer(req, res) {
    const {searchInput} = req.query;
    const user = req.session.user;
    let fitterCondition = {};
    if (searchInput !== ""){
        fitterCondition = {
            $or: [
                { tenKhachHang: searchInput },
                { email: searchInput }
            ]
        }
    }

    const customers = await KhachHangModel.find(fitterCondition).exec();
    
    return res.render("admin/customer/customers", {
        layout: "./layouts/main",
        page: "customers",
        title: "Quản lý khách hàng",
        user,
        customers,
    });
}
