// require('dotenv').config({path: './env'}); no issue with this but we will do more professional 

import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';




//2nd approach is here... 

dotenv.config({ path: "./env" }); // its required syntax should be used. we should change in our pkg json.. devScript:-> -r dotenv/config --experimental-json-modules

// async code give you the promise so you can use then and catch
connectDB()
    .then(() => { // we didn't let our code to listen, only db was connected but app should know that server is listening....

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is listening on Port ${process.env.PORT}`);

        })
    }
    )
    .catch((err) => {
        console.log("Connection of DB Failed! ", err);
    }
)


