export async function renderRevenueReportPage(req, res, next) {
    const user = req.session.user;

    return res.render("admin/report/revenueReport", {
        layout: "./layouts/admin",
        page: "revenueReport",
        title: "Thống kê doanh thu",
        user: user,
    });
}

export async function renderExpenditureReportPage(req, res, next) {
    const user = req.session.user;

    return res.render("admin/report/expenditureReport", {
        layout: "./layouts/admin",
        page: "expenditureReport",
        title: "Thống Kê Chi Tiêu",
        user: user,
    });
}
