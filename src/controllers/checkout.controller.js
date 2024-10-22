const VIEW_OPTIONS = {
    CHECKOUT: {
        layout: "./layouts/main",
        title: "Thanh toán",
    },
};

export async function renderCheckoutPage(req, res) {
    return res.render("checkout/index", {
        ...VIEW_OPTIONS.CHECKOUT,
    });
}
