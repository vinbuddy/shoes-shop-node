import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import KhachHangModel from "../models/khachHang.model.js";

import env from "dotenv";
env.config();

export function initializeLoginWithGoogleService() {
    passport.use(
        new Strategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const customerFound = await KhachHangModel.findOne({
                        email: profile.emails?.[0].value,
                    }).lean();

                    if (customerFound) done(null, customerFound);

                    // Login
                    if (customerFound && customerFound.googleId === profile.id) {
                        done(null, customerFound);
                    }

                    // Login and update googleId
                    if (customerFound && !customerFound.googleId) {
                        const user = await KhachHangModel.findByIdAndUpdate(
                            customerFound._id,
                            {
                                googleId: profile.id,
                            },
                            { new: true }
                        );

                        if (user) done(null, user);
                    }

                    // Register new user
                    if (!customerFound) {
                        const customer = await KhachHangModel.create({
                            googleId: profile.id,
                            tenKhachHang: profile.displayName,
                            email: profile.emails?.[0].value,
                            anhDaiDien: profile.photos?.[0].value,
                        });

                        done(null, customer);
                    }
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
}
