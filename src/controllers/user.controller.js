import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


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

export default registerUser
