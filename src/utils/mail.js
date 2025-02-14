import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_APP_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

export async function sendEmail(from, to, subject, content) {
    try {
        await transporter.sendMail({
            from: {
                name: "Shoes Shop",
                address: from,
            },
            to,
            subject,
            text: content,
        });

        return true;
    } catch (error) {
        console.log("SEND EMAIL ERROR: ", error);
        return false;
    }
}
