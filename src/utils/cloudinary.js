import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ resource_type: "auto", folder: folder }, (error, result) => {
                if (error) return reject(error);

                if (result) {
                    resolve({
                        publicId: result.public_id,
                        url: result.secure_url,
                        width: result.width,
                        height: result.height,
                        type: result.resource_type,
                    });
                }
            })
            .end(file.buffer);
    });
};

export const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/upload/");
        if (parts.length < 2) {
            throw new Error("Invalid Cloudinary URL format");
        }
        const publicIdWithExtension = parts[1];

        const publicId = publicIdWithExtension.split(".").slice(0, -1).join(".");
        return publicId;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const deleteFromCloudinary = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type: "image" }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (result.result === "ok") {
                resolve({
                    success: true,
                    message: "File deleted successfully",
                });
            } else {
                resolve({
                    success: false,
                    message: "File not found or could not be deleted",
                });
            }
        });
    });
};
