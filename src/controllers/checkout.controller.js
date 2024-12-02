import env from "dotenv";
import axios from "axios";
import querystring from "qs";
import crypto from "crypto";
import { formatVNCurrency } from "../utils/format.js";
import { sortObject } from "../utils/sort.js";
import DonHangModel from "../models/donHang.model.js";
import SanPhamModel from "../models/sanPham.model.js";
import GioHangModel from "../models/gioHang.model.js";
import TrangThaiModel from "../models/trangThai.model.js";
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
    CHECKOUT_RESULT: {
        layout: "./layouts/main",
        title: "Kết quả thanh toán",
        formatVNCurrency: formatVNCurrency,
    },
};

export async function renderCheckoutPage(req, res) {
    if (!req.session.customer) {
        return res.redirect("/auth/login");
    }

    if (!req.session.selectedItems || req.session.selectedItems.length === 0) {
        return res.redirect("/");
    }

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

// Helper function to create order
async function createVNPayUrl(req, res, order) {
    try {
        process.env.TZ = "Asia/Ho_Chi_Minh";

        let date = new Date();
        // Format date as "YYYYMMDDHHmmss"
        const createDate = date.toISOString().slice(0, 19).replace(/[-:T]/g, "");

        let ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let tmnCode = process.env.vnp_TmnCode;
        let secretKey = process.env.vnp_HashSecret;
        let vnpUrl = process.env.vnp_Url;
        let returnUrl = process.env.vnp_ReturnUrl;

        let locale = req.body.language;
        if (!locale) locale = "vn";

        let bankCode = "VNBANK";
        let currCode = "VND";
        let vnp_Params = {};

        vnp_Params["vnp_Version"] = "2.1.0";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;
        vnp_Params["vnp_Amount"] = order.tongTienThanhToan * 100;
        vnp_Params["vnp_Locale"] = locale;
        vnp_Params["vnp_CurrCode"] = currCode;
        vnp_Params["vnp_TxnRef"] = order.maDonHang.toString();
        vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + order.maDonHang.toString();
        vnp_Params["vnp_OrderType"] = "other";
        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        vnp_Params["vnp_BankCode"] = bankCode;

        vnp_Params = sortObject(vnp_Params);

        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

        vnp_Params["vnp_SecureHash"] = signed;
        vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

        return res.redirect(vnpUrl);
    } catch (error) {
        throw new Error(error.message);
    }
}

async function createMoMoUrl(req, res, order) {
    try {
        const partnerCode = "MOMO";
        const accessKey = "F8BBA842ECF85";
        const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

        const requestId = order.maDonHang.toString();
        const orderId = requestId;

        const orderInfo = "Thanh toán bằng MoMo cho đơn: " + orderId;

        const redirectUrl = process.env.momo_ReturnUrl;
        const ipnUrl = process.env.momo_ReturnUrl;

        const amount = order.tongTienThanhToan;

        const requestType = "payWithATM";
        const extraData = ""; // Empty if merchant does not have stores

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac("sha256", secretkey).update(rawSignature).digest("hex");

        // JSON object to send to MoMo endpoint
        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: "en",
        };

        const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
            headers: { "Content-Type": "application/json" },
        });

        const momo_payment_url = response.data.payUrl;

        return momo_payment_url;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function checkoutHandler(req, res) {
    try {
        const { receiverName, phoneNumber, fullAddress, paymentMethod, shippingFee } = req.body;

        const selectedItems = req.session.selectedItems;

        const orderDetailItems = selectedItems.map((item) => {
            return {
                maSanPham: item.maSanPham,
                maKichCoSanPham: item.maKichCoSanPham,
                soLuongDaChon: item.soLuongSanPham,
                giaDaChon: item.giaSanPham,
            };
        });

        const totalOrderPrice = orderDetailItems.reduce(
            (total, item) => total + item.soLuongDaChon * item.giaDaChon,
            0
        );
        const firstTrangThai = await TrangThaiModel.findOne();
        const orderData = {
            maKhachHang: req.session.customer.maKhachHang,
            maNguoiTao: null,
            chiTietDonHang: orderDetailItems,
            thongTinGiaoHang: {
                phiVanChuyen: Number(shippingFee),
                diaChiGiaoHang: fullAddress,
                tenNguoiNhan: receiverName,
                soDienThoaiNguoiNhan: phoneNumber,
            },
            thongTinThanhToan: {
                phuongThucThanhToan: paymentMethod,
                trangThaiThanhToan: "Đang chờ",
            },
            tongTienThanhToan: Number(totalOrderPrice) + Number(shippingFee),
            trangThaiDonHang: [
                {
                    maTrangThai: firstTrangThai.maTrangThai,
                    _id: firstTrangThai.maTrangThai,
                    thoiGian: new Date(),
                },
            ],
            ngayDatHang: new Date(),
        };

        const newOrder = await DonHangModel.create(orderData);
        const tempOrder = newOrder;

        await DonHangModel.findByIdAndUpdate(newOrder._id, {
            maDonHang: newOrder._id,
        });

        tempOrder["maDonHang"] = newOrder._id;

        req.session.tempOrder = tempOrder;
        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });

        // Check payment method
        switch (paymentMethod) {
            case "VNPay": {
                await DonHangModel.findByIdAndDelete(newOrder._id);
                const url = createVNPayUrl(req, res, tempOrder);
                return res.redirect(url);
            }
            case "MoMo": {
                await DonHangModel.findByIdAndDelete(newOrder._id);
                const url = await createMoMoUrl(req, res, tempOrder);
                return res.redirect(url);
            }
            default: {
                // Update trạng thái đơn hàng
                await DonHangModel.findByIdAndUpdate(newOrder._id, {
                    maDonHang: newOrder._id,
                    thongTinThanhToan: {
                        ...newOrder.thongTinThanhToan,
                        trangThaiThanhToan: "Hoàn thành",
                    },
                });

                // Update product quantity
                await Promise.all(
                    tempOrder.chiTietDonHang.map(async (item) => {
                        const product = await SanPhamModel.findOne({ maSanPham: item.maSanPham });
                        const sizeIndex = product.danhSachKichCo.findIndex(
                            (size) => size.maKichCo.toString() === item.maKichCoSanPham.toString()
                        );

                        product.danhSachKichCo[sizeIndex].soLuongKichCo -= item.soLuongDaChon;
                        await product.save();

                        // Remove item from cart
                        await GioHangModel.findOneAndUpdate(
                            { maKhachHang: req.session.customer.maKhachHang },
                            {
                                $pull: {
                                    danhSachSanPham: {
                                        maSanPham: item.maSanPham,
                                        maKichCoSanPham: item.maKichCoSanPham,
                                    },
                                },
                            }
                        );
                    })
                );

                return res.render("checkout/result", {
                    ...VIEW_OPTIONS.CHECKOUT_RESULT,
                    order: newOrder,
                });
            }
        }
    } catch (error) {
        console.error("Error creating order: ", error);

        // Clear tempOrder from session
        req.session.tempOrder = null;

        return res.render("checkout/index", {
            ...VIEW_OPTIONS.CHECKOUT,
            error: error.message,
        });
    }
}

// Call back from  VNPay or MoMo
export async function renderCheckoutResultPage(req, res) {
    try {
        const statusCode = req.query?.vnp_ResponseCode?.toString() || req.query?.resultCode?.toString();
        const tempOrder = req.session.tempOrder;
        console.log("tempOrder: ", tempOrder);

        if (!tempOrder) {
            throw new Error("Không tìm thấy đơn hàng.");
        }

        // Kiểm tra phuong thức thanh toán
        if (tempOrder.thongTinThanhToan.phuongThucThanhToan === "Tiền mặt") {
            return res.render("checkout/result", {
                ...VIEW_OPTIONS.CHECKOUT_RESULT,
                order: tempOrder,
            });
        }

        if (statusCode !== "00" && statusCode !== "0") {
            throw new Error("Thanh toán thất bại.");
        }

        const orderData = {
            ...tempOrder,
            thongTinThanhToan: {
                ...tempOrder.thongTinThanhToan,
                trangThaiThanhToan: "Hoàn thành",
                maGiaoDich: req.query?.vnp_TransactionNo?.toString() || req.query?.transId?.toString(),
            },
        };

        // Insert tempOrder to db
        const newOrder = await DonHangModel.create(orderData);

        // Update product quantity
        await Promise.all(
            tempOrder.chiTietDonHang.map(async (item) => {
                const product = await SanPhamModel.findOne({ maSanPham: item.maSanPham });
                const sizeIndex = product.danhSachKichCo.findIndex(
                    (size) => size.maKichCo.toString() === item.maKichCoSanPham.toString()
                );

                product.danhSachKichCo[sizeIndex].soLuongKichCo -= item.soLuongDaChon;
                await product.save();

                // Remove item from cart
                await GioHangModel.findOneAndUpdate(
                    { maKhachHang: req.session.customer.maKhachHang },
                    {
                        $pull: {
                            danhSachSanPham: {
                                maSanPham: item.maSanPham,
                                maKichCoSanPham: item.maKichCoSanPham,
                            },
                        },
                    }
                );
            })
        );

        // Clear tempOrder from session
        req.session.tempOrder = null;
        req.session.selectedItems = null;
        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });

        return res.render("checkout/result", {
            ...VIEW_OPTIONS.CHECKOUT_RESULT,
            order: newOrder,
        });
    } catch (error) {
        return res.render("checkout/result", {
            ...VIEW_OPTIONS.CHECKOUT_RESULT,
            error: error.message,
        });
    }
}
