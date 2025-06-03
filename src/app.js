import express from "express"
import cors from 'cors'
import cookieParser from 'cookies-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,

}))

//form sy data aye ga to json main hoga aur size 16kb ka hoga.. these are configurations 
app.use(express.json({limit: "16kb"}))

//what if data URL sy aata ho?? uska thora sa scene different hota, to bataana to pary ga? 
// express. apko configuration direct deta hai so use karo 
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// final configuration , pdf file images to be stored in mery passs.
// public main rakhty hai ....

app.use(express.static("public"));


// hmny parser cookies use nhi kia,, hm cookies sy data bhe ly skty user ka

app.use(cookieParser());
 

export {app} 