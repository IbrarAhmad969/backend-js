import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // getting the token access. 
    // ho skta cookie ho ya na ho, to optional ? yh lagaw, mobile k liye, aur header main agar data 
    // araha hai to us k liye bhe check kro 

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
    
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")   
        }
    
        req.user = user;
    
        next();
    } catch (error) {
       throw new ApiError(401, error?.message || "invalid access token ");
          
    }

})