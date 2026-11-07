import { body } from "express-validator";


const userRegistrationValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is not valid"),
        body("username").trim().notEmpty().withMessage("Username is required").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long").isLowercase().withMessage("Username must be in lowercase"),
        body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("fullName").optional().trim().isLength({ min: 2 }).withMessage("Full name must be at least 2 characters long"),
    ]
}

export { userRegistrationValidator }