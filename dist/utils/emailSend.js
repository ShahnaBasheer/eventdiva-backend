"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeEmail = exports.sendEmail = exports.sendOtpByEmail = void 0;
const otp_generator_1 = __importDefault(require("otp-generator"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const customError_1 = require("../errors/customError");
const sendEmail = (mailOption) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: "eventdivaofficial@gmail.com",
                pass: "ddts qspf veuh slio",
            },
        });
        yield transporter.sendMail(mailOption);
        return true;
    }
    catch (error) {
        console.log(error === null || error === void 0 ? void 0 : error.message, "heyy");
        return false;
    }
});
exports.sendEmail = sendEmail;
const sendOtpByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = otp_generator_1.default.generate(6, { specialChars: false });
    const mailOptions = {
        from: `"${process.env.EMAIL_ADDRESS}"`,
        to: `"${email}"`,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}. Please use this OTP to verify your email address.`
    };
    // Send OTP email
    if (!(yield sendEmail(mailOptions))) {
        throw new customError_1.ServiceUnavailableError('Failed to send OTP email. Please try again later.');
    }
    return otp;
});
exports.sendOtpByEmail = sendOtpByEmail;
const welcomeEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `"${process.env.EMAIL_ADDRESS}"`,
        to: `"${email}"`,
        subject: 'Welcome to EventDiva',
        text: `Welcome to EventDiva! Start planning your next event effortlessly and 
             connect with experts in the industry. Explore events, plan your own, 
             and stay updated with tips and trends.`
    };
    // Send OTP email
    if (!(yield sendEmail(mailOptions))) {
        throw new customError_1.ServiceUnavailableError('Failed to Welcome Mail');
    }
    return true;
});
exports.welcomeEmail = welcomeEmail;
