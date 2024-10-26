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
