import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/api-response.js";
import {asyncHandler} from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import {sendEmail} from "../utils/mail.js";
import {emailVerificationMaingenContent} from "../utils/mail.js";

export const verifyJWT = asyncHandler(async (req,res,next)=>{
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","")
    if (!token){
        throw new ApiError(401, "Unauthorized access", []);
    }
    try {
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");
        if (!user){
            throw new ApiError(401, "Unauthorized access", []);
        }
        req.user = user;
        return next();
    }catch (error) {
        throw new ApiError(401, " invalid access token", []);
    }
    
})