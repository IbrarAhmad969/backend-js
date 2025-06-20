import { Router } from "express";
import {registerUser, logOutUser, loginUser} from "../controllers/user.controller.js"
const router = Router();
import { upload } from "../middlewares/Multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

router.route("/register").post(
    upload.fields([ // Two objects are received, these are for the files
        { // now including data, you send images. 
            
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

// secured Routes 

router.route("/logout").post(verifyJWT, logOutUser)


// http://localhost:8000/users/reg

export default router