import { Router } from "express";
import registerUser from "../controllers/user.controller.js"
const router = Router();
import { upload } from "../middlewares/Multer.middleware.js";

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
// http://localhost:8000/users/reg

export default router