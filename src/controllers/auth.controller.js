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

export async function registerHandler(req, res) {
    try {
        const { email, password, username } = req.body;

        const isExists = await CustomerModel.findOne({
            email: email,
            isVerified: true,
        });

        // Check if email already exists, redirect to register page with error message
        if (isExists) {
            return res.render("auth/register", {
                layout: "./layouts/auth",
                error: "Email đã tồn tại.",
            });
        }

        const redisClient = getRedis();

        const existingOTP = await redisClient.get(email);

        if (existingOTP) {
            // If OTP exists, delete it
            await redisClient.del(email);
            console.log(`Deleted existing OTP for ${email}`);
        }

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        // Set OTP to Redis with 5 minutes expiration
        await redisClient.setEx(email, 300, otp);
        console.log(`OTP for ${email} is set in Redis: ${otp}`);

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

        return res.render("auth/verify-otp", {
            layout: "./layouts/auth",
            email,
            message: "OTP đã gửi đến email của bạn",
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
