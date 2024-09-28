export function renderLoginPage(req, res) {
    return res.render("auth/login", { layout: "./layouts/auth" });
}

export function renderRegisterPage(req, res) {
    return res.render("auth/register", { layout: "./layouts/auth" });
}
