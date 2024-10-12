import otpGenerator from "otp-generator";

import CustomerModel from "../models/customer.model.js";
import { getRedis } from "../utils/redis.js";

import { sendEmail } from "../utils/mail.js";

export function renderLoginPage(req, res) {
    return res.render("auth/login", { layout: "./layouts/auth" });
}

export async function renderRegisterPage(req, res) {
    return res.render("auth/register", { layout: "./layouts/auth" });
}

export async function renderVerifyOTPPage(req, res) {
    return res.render("auth/otp", { layout: "./layouts/auth" });
}

//  HANDLERS
export async function registerHandler(req, res) {
    try {
        const { email, password, username } = req.body;

        const customer = await CustomerModel.findOne({
            email: email,
        });

        // Check if email already exists, redirect to register page with error message
        if (customer && customer.isVerified) {
            return res.render("auth/register", {
                layout: "./layouts/auth",
                error: "Người dùng đã tồn tại.",
            });
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
        const newCustomer = new CustomerModel({
            email,
            password,
            username,
        });

        await newCustomer.save();

        await sendEmail(
            process.env.EMAIL_APP_USER,
            email,
            "OTP for Shoes Shop",
            `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
        );

        return res.render("auth/otp", {
            layout: "./layouts/auth",
            email,
            message: "OTP đã gửi đến email của bạn",
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

export async function verifyOTPHandler(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email) {
            return res.render("auth/otp", {
                layout: "./layouts/auth",
                error: "Email không có giá trị",
            });
        }

        if (!otp) {
            return res.render("auth/otp", {
                layout: "./layouts/auth",
                email,
                error: "OTP không có giá trị",
            });
        }

        const redisClient = getRedis();

        const existingOTP = await redisClient.get(email);

        if (!existingOTP) {
            return res.render("auth/otp", {
                layout: "./layouts/auth",
                email,
                error: "OTP không hợp lệ hoặc đã hết hạn.",
            });
        }

        if (existingOTP !== otp) {
            return res.render("auth/otp", {
                layout: "./layouts/auth",
                email,
                error: "OTP không hợp lệ.",
            });
        }

        // If OTP is correct, delete it from Redis
        await redisClient.del(email);

        // Update isVerified to true
        await CustomerModel.updateOne({ email: email }, { isVerified: true });

        // Create session
        const customer = await CustomerModel.findOne({ email: email });
        req.session.customer = customer;

        return res.redirect("/");
    } catch (error) {
        return res.render("auth/otp", {
            layout: "./layouts/auth",
            error: error.message,
        });
    }
}
