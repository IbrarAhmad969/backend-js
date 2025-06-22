import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        // now generate the tokens 
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken();

        // we only store our refresh token 

        user.refreshToken = refreshToken
        // save in the mongo DB, for save we need a password, we give another var.
        // no need to validate passwords or thing. 

        await user.save({validateBeforeSave: false})

        // return , by returning accessToken is creating itself. we called the method

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something Went wrong while generating Refresh and Access token")
    }
}
// register user. 
const registerUser = asyncHandler(async (req, res) => {

    // Get the user Data 
    const { fullname, email, username, password } = req.body

    // Check if user Fields are empty, error messages 

    // use multiple ifs or use some method of array 
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }

    // Check if user Already exists or not get the user model 
    // check for email or password, use or operator 

    const existedUser =await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists ! ")
    }

    // Handling images and Avatars 
    // multer uses files, so use files for req, and we need its first property,
    // which in middleware and multer has already uploaded 

    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // check if avatar is available at local path now

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Entry in the DataBase

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken") // if user is found -means don't pick it up.
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a User")
    }

    // Return response 

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


})

// login user. 
const loginUser = asyncHandler(async(req, res)=>{
    // Steps to Login User. 

    // Step1. Req body sy data lo
    // username or email, login on one basis.
    // find the user
    // if no user, no request 
    // if user is present, check password
    // if Password is okay, Access token and refresh token
    // send these tokens in cookies. and give response 


    // Step1. Req body sy data lo
    const {email, username, password} = req.body

    // i need one of them, check condition 

    if(!(username || email)){
        throw new ApiError(400, "User Name or Password is required")
    }
    /// if both are there, then we have to login. we have to find on the basis of both ..

    const user = await User.findOne({ // array k andar object bhjo aur check ho jye ga
        $or: [{username}, {email}]
    })

    // if user is still not found then user is not there. 

    if(!(user)){
        throw new ApiError(404, "User doesn't exist");
    }

    // Now if user is found, check password. 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password incorrect");
    }

    // Access and Refresh Token, if everything is fine
    // we have to user these two more times, so create a method for that . 

    // call the method 

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // send them now in cookies.
    // we need to send info to user, and what info should be sent to the user. 

    // another query 

    // no need to send password to user. 

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken");

    // for cookies, should not be updated by user. make it secure. 

    const options = {
        httpOnly: true, 
        secure: true,

    }

    return res
    .status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken,
                // what if he wants to save the refresh token? in mobile there is no cookies. 

            },
            "User LoggedIn Successfully"
        )
    )
})
// logout user.
const logOutUser = asyncHandler(async(req, res)=>{
    // how can we logout? clear cookies, 
    // refresh token to khtm karna prhy ga

    // how to get the userId if he wants to logout? should he be entering email or password? NO
    // Middleware will play its role now, no need to get username or email 


    // now we have the user.. first create middleware
    // req.user._id

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },  
        {  // this is for return response with updated value, as we undefined the tokens. 

            new: true
        }
    )

    
    const options = {
        httpOnly: true, 
        secure: true,

    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logout"))
    
})

// Refresh Access token for user. don't type email/password again and again. 

const refreshAccessToken = asyncHandler(async (req, res)=>{
    // steps. 
    // first Access token from cookies. 
    const incomingRequestToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRequestToken){
        throw new ApiError(401, "UnAuthorized Request ")
    }

    // Verify the token, we have jwt 

    try {
        const decodedToken = jwt.verify(
            incomingRequestToken,
            process.env.REFRESH_TOKEN_SECRET,
    
        )
    
        // when we created refreshtoken, we had an Id
    
       const user = User.findById(decodedToken?.id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token ")
        }
    
        // match both the tokens, incoming, and saved. 
    
        if(incomingRequestToken !==user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        // now generate a new token, we already have a method. 
    
        const options = {
            httpOnly: true, 
            secure: true, 
        }
        // option is for cookies. 
    
        const {accessToken, new_refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        // now send the response. 
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", new_refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken, refreshToken: new_refreshToken
                }, 
                "Access Token Refreshed "
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }

})

export {
    registerUser,
    loginUser, 
    logOutUser,
    refreshAccessToken
}
