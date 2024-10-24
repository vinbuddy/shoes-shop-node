import env from "dotenv";
import { formatVNCurrency } from "../utils/format.js";
import axios from "axios";
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
        formatVNCurrency: formatVNCurrency,
    },
};

export async function renderCheckoutPage(req, res) {
    return res.render("checkout/index", {
        ...VIEW_OPTIONS.CHECKOUT,
    });
}

export async function calculateShippingFeeHandlerRequest(req, res) {
    try {
        const { toDistrictId, toWardCode, quantity } = req.body;

        // Thông số cố định của sản phẩm
        const shoeDimensions = {
            height: 12, // cm
            length: 28, // cm
            width: 10, // cm
            weight: 900, // gram
        };

        // Tính toán thông số gói hàng
        const packageDimensions = {
            height: shoeDimensions.height * quantity, // Chiều cao tổng
            length: shoeDimensions.length, // Chiều dài tổng (giữ nguyên)
            width: shoeDimensions.width, // Chiều rộng tổng (giữ nguyên)
            weight: shoeDimensions.weight * quantity, // Trọng lượng tổng
        };

        const requestData = {
            service_type_id: 2,
            to_district_id: Number(toDistrictId), // Quận nơi nhận
            to_ward_code: toWardCode, // Phường nơi nhận
            insurance_value: 0, // Giá trị bảo hiểm cho gói hàng,
            coupon: null, // Mã giảm giá,
            ...packageDimensions,
        };

        // Gọi API tính phí ship
        const response = await axios.post(`${process.env.GHN_SHIPPING_BASE_URL}/fee`, requestData, {
            headers: {
                Token: process.env.GHN_TOKEN,
                ShopId: process.env.GHN_SHOPID,
            },
        });
        const { data } = response.data;

        const shippingFee = data.total;

        return res.status(200).json({
            shippingFee,
        });
    } catch (error) {
        console.error("Error fetching shipping fee: ", error.response ? error.response.data : error.message);
        return res.status(500).json({
            message: error.response ? error.response.data : error.message,
        });
    }
}
