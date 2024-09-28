export function renderCartPage(req, res) {
    return res.render("cart/index", { layout: "./layouts/main", page: "home", title: "Home page" });
}
