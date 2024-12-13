export async function verifyAdminRole(req, res, next) {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/admin-login");
        }

        if (req.session.user.maVaiTro.tenVaiTro !== "Quản trị viên") {
            const previousUrl = req.get("Referer") || "/auth/admin-login"; // Nếu không có Referer, chuyển hướng về trang chủ

            return res.redirect(previousUrl);
        }

        next();
    } catch (error) {
        console.log(error);

        return res.redirect("/auth/admin-login");
    }
}

// Kiểm tra quyền nhân viên kho
export async function verifyWarehouseStaffRole(req, res, next) {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/admin-login");
        }

        if (
            req.session.user.maVaiTro.tenVaiTro !== "Nhân viên kho" &&
            req.session.user.maVaiTro.tenVaiTro !== "Nhân viên quản lý" &&
            req.session.user.maVaiTro.tenVaiTro !== "Quản trị viên"
        ) {
            const previousUrl = req.get("Referer") || "/auth/admin-login";
            return res.redirect(previousUrl);
        }

        next();
    } catch (error) {
        console.log(error);

        return res.redirect("/auth/admin-login");
    }
}

// Kiểm tra quyền nhân viên bán hàng
export async function verifySalesStaffRole(req, res, next) {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/admin-login");
        }

        if (
            req.session.user.maVaiTro.tenVaiTro !== "Nhân viên bán hàng" &&
            req.session.user.maVaiTro.tenVaiTro !== "Nhân viên quản lý" &&
            req.session.user.maVaiTro.tenVaiTro !== "Quản trị viên"
        ) {
            const previousUrl = req.get("Referer") || "/auth/admin-login";
            return res.redirect(previousUrl);
        }

        next();
    } catch (error) {
        console.log(error);

        return res.redirect("/auth/admin-login");
    }
}

// Kiểm tra quyền quản lý
export async function verifyManagerRole(req, res, next) {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/admin-login");
        }

        if (
            req.session.user.maVaiTro.tenVaiTro !== "Nhân viên quản lý" &&
            req.session.user.maVaiTro.tenVaiTro !== "Quản trị viên"
        ) {
            const previousUrl = req.get("Referer") || "/auth/admin-login"; // Nếu không có Referer, chuyển hướng về trang chủ

            return res.redirect(previousUrl);
        }

        next();
    } catch (error) {
        console.log(error);

        return res.redirect("/auth/admin-login");
    }
}

// Kiểm tra đăng nhập
export async function verifyUserLogin(req, res, next) {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/admin-login");
        }

        next();
    } catch (error) {
        console.log(error);

        return res.redirect("/auth/admin-login");
    }
}
