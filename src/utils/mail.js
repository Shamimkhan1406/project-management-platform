import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Management",
            link: "http://localhost:8000"
        }
    })
    const emailTexual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_TRAP_HOST,
        port: process.env.MAIL_TRAP_PORT,
        auth: {
            user: process.env.MAIL_TRAP_USER,
            pass: process.env.MAIL_TRAP_PASS
        }
    });

    const mail = {
        from: "mail.taskmanager@gmail.com",
        to: options.to,
        subject: options.subject,
        text: emailTexual,
        html: emailHTML
    }
    try{
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}


const emailVerificationMaingenContent = (username, verificationURL)=>{
    return {
        body: {
            name: username,
            intro: "Welcome to Project Management! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email, please click here:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Verify your email",
                    link: verificationURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help." 
        }
    }
};

const forgotPasswordMaingenContent = (username, resetPasswordURL)=>{
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password.",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#2293bc", // Optional action button color
                    text: "Reset your password",
                    link: resetPasswordURL
                }
            },
            outro: "If you did not request a password reset, please ignore this email." 
        }
    }
};

export {emailVerificationMaingenContent, forgotPasswordMaingenContent, sendEmail};