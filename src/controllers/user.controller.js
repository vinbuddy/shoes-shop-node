export function renderUserProfilePage(req, res) {
    // Get User data from database here

    return res.render("user/index", {
        layout: "./layouts/user",
        page: "profile",
        title: "Profile",
    });
}
