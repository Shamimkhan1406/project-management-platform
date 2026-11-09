import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/api-response.js";
import {asyncHandler} from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {sendEmail} from "../utils/mail.js";
import {emailVerificationMaingenContent} from "../utils/mail.js";
import crypto from "node:crypto";

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

const login = asyncHandler(async (req,res)=>{
    const {email, password, username} = req.body;
    if (!email){
        throw new ApiError(400, "Email is required", []);
    }
    const user = await User.findOne({email})
    if (!user){
        throw new ApiError(404, "User not found", []);
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid){
        throw new ApiError(401, "Invalid password", []);
    }
    const {accessToken,refreshToken} =  await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
    ))

});

const logoutUser = asyncHandler(async (req,res)=>{
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: ""},
        },
        {new: true}
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        null,
        "User logged out successfully"
    ))
});

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
});

const verifyEmail = asyncHandler(async (req,res)=>{
    const {verificationToken} = req.params
    if (!verificationToken){
        throw new ApiError(400,"Email Verification token is missing");
    }
    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now()}
    });
    if (!user){
        throw new ApiError(400,"Email Verification token is invalid or expired");
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.isEmailVerified = true;
    await user.save({validateBeforeSave:false})
    res.status(200).json(
        new ApiResponse(
            200,
            {
                isEmailVerified: true
            },
            "Email is Varified",
        ),
    )
});

const resendEmailVerification = asyncHandler(async (req,res)=>{
    //...
    const user = await User.findById(req.user?._id);
    if (!user){
        throw new ApiError(404, "User doesn't exist");
    }
    if (user.isEmailVerified){
        throw new ApiError(409, "Email is already verified");
    }

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
    );

    return res.status(200).json(new ApiResponse(
        200,
        {},
        "Mail hasbeen sent to you email"
    ));

});

export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification
};
