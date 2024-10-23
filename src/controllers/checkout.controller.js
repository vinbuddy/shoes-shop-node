import env from "dotenv";
env.config();

const VIEW_OPTIONS = {
    CHECKOUT: {
        layout: "./layouts/main",
        title: "Thanh toán",
        ghn: {
            token: process.env.GHN_TOKEN,
            shopId: process.env.GHN_SHOP_ID,
            baseUrl: process.env.GHN_BASE_URL,
        },
    },
};

export async function renderCheckoutPage(req, res) {
    return res.render("checkout/index", {
        ...VIEW_OPTIONS.CHECKOUT,
    });
}
