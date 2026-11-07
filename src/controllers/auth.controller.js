import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/api-response.js";
import {asyncHandler} from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {sendEmail} from "../utils/mail.js";
import {emailVerificationMaingenContent} from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    const {email,username,password,role} = req.body
    const existingUser = await User.findOne({
        $or: [{email},{username}]
    })
    if (existingUser){
        throw new ApiError(409, "User with this email or username already exists",[]);
    }
    const user = await User.create({
        email,
        username,
        password,
        isEmailVerified: false,
    })
    const {unHashedToken, hashedToken, tokenExpiry}=user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendEmail(
        {
            to:user?.email,
            subject:"verify your email",
            mailgenContent:emailVerificationMaingenContent(
                user?.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`),
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while creating user", []);
    }

    return res.status(201).json(new ApiResponse(200,{
        message: "User registered successfully. Please check your email to verify your account.",
        data: createdUser,
    }))

});

export {registerUser}
