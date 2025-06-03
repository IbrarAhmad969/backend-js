import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';

//2nd approach is here... 
dotenv.config({ path: "./env" });
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is listening on Port ${process.env.PORT}`);
        })
    }
    )
    .catch((err) => {
        console.log("Connection of DB Failed! ", err);
    }
)


