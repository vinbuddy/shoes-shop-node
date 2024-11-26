export async function renderRevenueReportPage(req, res, next) {
    const user = req.session.user;

    return res.render("admin/report/revenueReport", {
        layout: "./layouts/admin",
        page: "revenueReport",
        title: "Báo cáo doanh thu",
        user: user,
    });
}

//API
