export function renderHomePage(req, res) {
    return res.render("index", { layout: "./layouts/main", page: "home", title: "Home page" });
}
