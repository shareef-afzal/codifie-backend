import mongoose from "mongoose";
import User from "../models/user.js";
import users from "./data.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/codifi";
mongoose.connect(MONGO_URL)
    .then(async()=>{
        console.log("connected to mongoDB");
        // await User.deleteMany({});
        await User.insertMany(users);
        console.log("Users inserted successfully!");
        mongoose.connection.close();
    })
    .catch((err)=>{
        console.error("DB connection error:",err);
    })