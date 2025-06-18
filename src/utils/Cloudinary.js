
import { v2 } from "cloudinary";
// first we place it on our server, and then upload to cloudinary

//fs: the Module of Node js, build in. 
// Link and Unlink is for the delete. 
import fs from 'fs'
import cloudinary from "cloudinary"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // how to upload now? 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) { 
        // remove the locally saved temp file as the uploaded operation got failed. 
        fs.unlinkSync(localFilePath)
        return null;

    }
}
export { uploadOnCloudinary }
