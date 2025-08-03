import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
import fetchRoutes from "./routes/fetchStats.js";
import cors from 'cors';
import customError from "../utils/customError.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from "passport";
import User from "../models/user.js";
import LocalStrategy from 'passport-local';

import dotenv from "dotenv";
dotenv.config();

const app = express();
const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("DB connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}
app.use(cors({
  origin: "https://codifie.vercel.app",
  credentials: true
}));
app.use(express.json());


const store=MongoStore.create({
  mongoUrl:MONGO_URL,
  crypto:{
    secret:"my secret",
  },
  touchAfter:24*3600,
})
store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
})
app.use(session({
  store,
  secret:"my secret",
  resave:false,
  saveUninitialized:false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,       // 1 day
    sameSite: "none",                 // <— allow cross-site
    secure: true,                     // <— only send over HTTPS
    httpOnly: true                    // <— prevents JS access (recommended)
  }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" },User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/users",userRoutes);
app.use("/fetch",fetchRoutes);

// basic route
app.get("/", (req, res) => {
  res.send("Codifi API is running");
});

// catch-all for any unhandled route (404)
app.use((req, res, next) => {
  next(new customError("page not found",404));
});
app.use((err,req,res,next)=>{
  const status=err.status || 500;
  const message=err.message|| "Internal server Error";
  res.status(status).json({error:message});
})

const PORT = process.env.PORT || 8080;
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
