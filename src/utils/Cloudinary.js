
import { v2 } from "cloudinary";
// first we place it on our server, and then upload to cloudinary

//fs: the Module of Node js, build in. 
// Link and Unlink is for the delete. 
import fs from 'fs'


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // how to upload now? 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on Cloudinary", response.url)
        return response;
    } catch (error) {
        // remove the locally saved temp file as the uploaded operation got failed. 
        fs.unlinkSync(localFilePath)
        return null;

    }
}
export {uploadOnCloudinary}
