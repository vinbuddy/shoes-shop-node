import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import env from "dotenv";

import KhachHangModel from "../models/khachHang.model.js";
import NguoiDungModel from "../models/nguoidung.model.js";
import { getRedis } from "../utils/redis.js";
import { sendEmail } from "../utils/mail.js";
import { syncCartItemsAfterLogin } from "./cart.controller.js";

env.config();

const VIEW_OPTIONS = {
    REGISTER: {
        layout: "./layouts/auth",
        title: "Đăng ký",
        googleLoginUrl: `${process.env.BASE_URL}/auth/google`,
    },
    LOGIN: {
        layout: "./layouts/auth",
        title: "Đăng nhập",
        googleLoginUrl: `${process.env.BASE_URL}/auth/google`,
    },
    VERIFY_OTP: {
        layout: "./layouts/auth",
        title: "Xác thực OTP",
    },
    FORGOT_PASSWORD: {
        layout: "./layouts/auth",
        title: "Quên mật khẩu",
    },
    RESET_PASSWORD: {
        layout: "./layouts/auth",
        title: "Đặt lại mật khẩu",
    },
};

export function renderLoginPage(req, res) {
    return res.render("auth/login", VIEW_OPTIONS.LOGIN);
}

export async function renderRegisterPage(req, res) {
    return res.render("auth/register", VIEW_OPTIONS.REGISTER);
}

export async function renderVerifyOTPPage(req, res) {
    return res.render("auth/otp", VIEW_OPTIONS.VERIFY_OTP);
}

export async function renderForgotPasswordPage(req, res) {
    return res.render("auth/forgot", VIEW_OPTIONS.FORGOT_PASSWORD);
}

//  HANDLERS
export async function registerHandler(req, res) {
    try {
        const { email, password, username } = req.body;

        const customer = await KhachHangModel.findOne({
            email: email,
        });

        // Check if email already exists, redirect to register page with error message
        if (customer && customer.trangThaiXacThuc) {
            throw new Error("Người dùng đã tồn tại.");
        }

        const redisClient = getRedis();

        const existingOTP = await redisClient.get(email);

        if (existingOTP) {
            await redisClient.del(email);
        }

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        // Set OTP to Redis with 5 minutes expiration
        await redisClient.setEx(email, 300, otp);

        // Create new customer with isVerified: false
        const newCustomer = new KhachHangModel({
            email,
            matKhau: password,
            tenKhachHang: username,
        });

        await newCustomer.save();

        // Update maKhachHang
        await KhachHangModel.updateOne(
            { email },
            {
                $set: {
                    maKhachHang: newCustomer._id,
                },
            }
        );

        await sendEmail(
            process.env.EMAIL_APP_USER,
            email,
            "OTP for Shoes Shop",
            `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
        );

        return res.render("auth/otp", {
            ...VIEW_OPTIONS.VERIFY_OTP,
            email,
            message: "OTP đã gửi đến email của bạn",
        });
    } catch (error) {
        return res.render("auth/register", {
            ...VIEW_OPTIONS.REGISTER,
            error: error.message,
        });
    }
}

export async function verifyOTPHandler(req, res) {
    const { email, otp } = req.body;

    try {
        if (!email) {
            throw new Error("Email không có giá trị");
        }

        if (!otp) {
            throw new Error("OTP không có giá trị");
        }

        const redisClient = getRedis();

        const existingOTP = await redisClient.get(email);

        if (!existingOTP) {
            throw new Error("OTP không hợp lệ hoặc đã hết hạn.");
        }

        if (existingOTP !== otp) {
            throw new Error("OTP không hợp lệ.");
        }

        // If OTP is correct, delete it from Redis
        await redisClient.del(email);

        // Update isVerified to true
        await KhachHangModel.updateOne({ email: email }, { trangThaiXacThuc: true });

        // Create session
        const customer = await KhachHangModel.findOne({ email: email });
        req.session.customer = customer;

        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });

        // Sync cart
        const result = syncCartItemsAfterLogin(req);

        if (result) {
            // Clear cookie cartItems
            res.clearCookie("cartItems");
        }

        return res.redirect("/");
    } catch (error) {
        return res.render("auth/otp", {
            ...VIEW_OPTIONS.VERIFY_OTP,
            error: error.message,
            email,
        });
    }
}

export async function logoutHandler(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.redirect("/");
        }

        // Clear cookie
        res.clearCookie("connect.sid"); // Clear the session cookie

        return res.redirect("/auth/login");
    });
}

export async function loginHandler(req, res) {
    try {
        const { email, password } = req.body;

        const customer = await KhachHangModel.findOne({
            email: email,
        });

        if (!customer) {
            throw new Error("Người dùng không tồn tại.");
        }

        if (!customer.trangThaiXacThuc) {
            throw new Error("Người dùng chưa xác thực.");
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, customer.matKhau);

        if (!isMatch) {
            throw new Error("Mật khẩu không chính xác.");
        }

        // Create session
        req.session.customer = customer;
        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });

        // Sync cart
        const result = syncCartItemsAfterLogin(req);

        if (result) {
            // Clear cookie cartItems
            res.clearCookie("cartItems");
        }

        return res.redirect("/");
    } catch (error) {
        return res.render("auth/login", {
            ...VIEW_OPTIONS.LOGIN,
            error: error.message,
        });
    }
}

export async function resendOTPHandler(req, res) {
    const { email } = req.query;

    try {
        if (!email) {
            throw new Error("Email không có giá trị");
        }

        const customer = await KhachHangModel.findOne({
            email: email,
        });

        if (!customer) {
            throw new Error("Người dùng không tồn tại.");
        }

        if (customer.trangThaiXacThuc) {
            throw new Error("Người dùng đã xác thực.");
        }

        const redisClient = getRedis();

        const existingOTP = await redisClient.get(email);

        if (existingOTP) {
            await redisClient.del(email);
        }

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        // Set OTP to Redis with 5 minutes expiration
        await redisClient.setEx(email, 300, otp);

        await sendEmail(
            process.env.EMAIL_APP_USER,
            email,
            "OTP for Shoes Shop",
            `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
        );

        return res.render("auth/otp", {
            ...VIEW_OPTIONS.VERIFY_OTP,
            email,
            message: "OTP đã gửi đến email của bạn",
        });
    } catch (error) {
        return res.render("auth/otp", {
            ...VIEW_OPTIONS.VERIFY_OTP,
            error: error.message,
            email,
        });
    }
}

const _generateToken = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
};

export async function forgotPasswordHandler(req, res) {
    try {
        const { email } = req.body;

        const user = await KhachHangModel.findOne({ email });

        if (!user) {
            throw new Error("Email không tồn tại");
        }

        const token = _generateToken();
        const redisClient = getRedis();

        const tokenExpiry = 3600; // 1 hour

        await redisClient.setEx(email, tokenExpiry, token);

        // const resetLink = `${req.protocol}://${req.get("host")}/auth/reset-password?token=${token}&email=${email}`;
        const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${token}&email=${email}`;

        await sendEmail(
            process.env.EMAIL_APP_USER,
            email,
            "Reset Password",
            `Bạn nhận được email này vì bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào đường dẫn sau để đặt lại mật khẩu: ${resetLink}`
        );

        return res.render("auth/forgot", { ...VIEW_OPTIONS.FORGOT_PASSWORD, message: "Email đã được gửi" });
    } catch (error) {
        return res.render("auth/forgot", { ...VIEW_OPTIONS.FORGOT_PASSWORD, error: error.message });
    }
}

export async function renderResetPasswordPage(req, res) {
    const { email, token } = req.query;

    try {
        const redisClient = getRedis();
        const storedToken = await redisClient.get(email);

        if (!storedToken) {
            throw new Error("Token không hợp lệ hoặc đã hết hạn.");
        }

        if (storedToken !== token) {
            throw new Error("Token không hợp lệ.");
        }

        return res.render("auth/reset", { ...VIEW_OPTIONS.RESET_PASSWORD, token, email });
    } catch (error) {
        return res.render("auth/reset", { ...VIEW_OPTIONS.RESET_PASSWORD, token, email, error: error.message });
    }
}

export async function resetPasswordHandler(req, res) {
    const { email, password, token } = req.body;

    try {
        if (!email || !password || !token) {
            throw new Error("Dữ liệu đầu vào không hợp lệ");
        }

        const redisClient = getRedis();
        const storedToken = await redisClient.get(email);

        if (!storedToken) {
            return res.render("auth/reset", {
                ...VIEW_OPTIONS.RESET_PASSWORD,
                error: "Token không hợp lệ hoặc đã hết hạn.",
                token,
                email,
            });
        }

        if (storedToken !== token) {
            return res.render("auth/reset", {
                ...VIEW_OPTIONS.RESET_PASSWORD,
                error: "Token không hợp lệ.",
                token,
                email,
            });
        }

        // Delete token from Redis
        await redisClient.del(email);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await KhachHangModel.updateOne({ email }, { matKhau: hashedPassword });

        return res.redirect("/auth/login");
    } catch (error) {
        return res.render("auth/reset", { ...VIEW_OPTIONS.RESET_PASSWORD, error: error.message, token, email });
    }
}

// Google
export async function googleAuthCallbackHandler(req, res) {
    try {
        const customer = req.user;

        req.session.customer = customer;

        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });

        // Sync cart
        const result = syncCartItemsAfterLogin(req);

        if (result) {
            // Clear cookie cartItems
            res.clearCookie("cartItems");
        }

        return res.redirect("/");
    } catch (error) {
        res.render("auth/login", { ...VIEW_OPTIONS.LOGIN, error: error.message });
    }
}

// Admin
export function renderAdminLoginPage(req, res) {
    return res.render("admin/auth/login", {
        layout: "./layouts/auth",
        page: "login",
        title: "Đăng nhập quản trị",
    });
}
export async function adminLoginHandler(req, res) {
    try {
        const { email, password } = req.body;

        const user = await NguoiDungModel.findOne({
            email: email,
        }).populate("maVaiTro");

        if (!user) {
            throw new Error("Người dùng không tồn tại.");
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.matKhau);

        if (!isMatch) {
            throw new Error("Mật khẩu không chính xác.");
        }

        // Create session
        req.session.user = user;
        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });
        
        return res.redirect("/admin/dashboard");

        return res.redirect("/admin/profile");
    } catch (error) {
        return res.render("admin/auth/login", {
            ...VIEW_OPTIONS.LOGIN,
            error: error.message,
        });
    }
}

export async function adminLogoutHandler(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.redirect("/");
        }

        // Clear cookie
        res.clearCookie("connect.sid"); // Clear the session cookie

        return res.redirect("/admin/auth/admin-login");
    });
}
export async function renderAdminProfilePage(req, res) {
    const { email, token } = req.query;

    try {
        const redisClient = getRedis();
        const storedToken = await redisClient.get(email);

        if (!storedToken) {
            throw new Error("Token không hợp lệ hoặc đã hết hạn.");
        }

        if (storedToken !== token) {
            throw new Error("Token không hợp lệ.");
        }

        return res.render("admin/profile", { ...VIEW_OPTIONS.RESET_PASSWORD, token, email });
    } catch (error) {
        return res.render("admin/profile", { ...VIEW_OPTIONS.RESET_PASSWORD, token, email, error: error.message });
    }
}
export async function adminChangePasswordHandler(req, res) {
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.session.user;

    try {
        if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
            throw new Error("Dữ liệu đầu vào không hợp lệ");
        }

        const isMatch = await bcrypt.compare(oldPassword, user.matKhau);
        if (isMatch) {
            if (newPassword === confirmNewPassword) {
                //
            } else {
                return res.render("admin/user/profile", {
                    ...VIEW_OPTIONS.RESET_PASSWORD,
                    error: "Mật khẩu mới và nhập lại mật khẩu không khớp.",
                    user: user,
                });
            }
        } else {
            return res.render("admin/user/profile", {
                ...VIEW_OPTIONS.RESET_PASSWORD,
                error: "Mật khẩu cũ không đúng.",
                user: user,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await NguoiDungModel.updateOne({ email }, { matKhau: hashedPassword });

        return res.redirect("/admin/profile");
    } catch (error) {
        return res.render("admin/user/profile", { ...VIEW_OPTIONS.RESET_PASSWORD, error: error.message, email });
    }
}
