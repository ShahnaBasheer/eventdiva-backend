import  otpGenerator  from 'otp-generator';
import { mailOption } from "../interfaces/utilities.interface";
import nodemailer from "nodemailer";
import { ServiceUnavailableError } from '../errors/customError';


const sendEmail = async (mailOption: mailOption) => {
    try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: "eventdivaofficial@gmail.com",
            pass: "ddts qspf veuh slio",
          },
        });
        await transporter.sendMail(mailOption)
        return true; 
    } catch (error: any) {
        console.log(error?.message, "heyy");
        return false;
    }
};

const sendOtpByEmail = async (email: string): Promise<string> => {
    const otp = otpGenerator.generate(6, { specialChars: false });
  
    const mailOptions: mailOption = {
        from: `"${process.env.EMAIL_ADDRESS}"`,
        to: `"${email}"`,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}. Please use this OTP to verify your email address.`
    };
    // Send OTP email
    if (!await sendEmail(mailOptions)) {
        throw new ServiceUnavailableError('Failed to send OTP email. Please try again later.');
    }
    return otp; 
}


const welcomeEmail = async (email: string): Promise<boolean> => {
  const mailOptions: mailOption = {
      from: `"${process.env.EMAIL_ADDRESS}"`,
      to: `"${email}"`,
      subject: 'Welcome to EventDiva',
      text: `Welcome to EventDiva! Start planning your next event effortlessly and 
             connect with experts in the industry. Explore events, plan your own, 
             and stay updated with tips and trends.`
  };
  // Send OTP email
  if (!await sendEmail(mailOptions)) {
      throw new ServiceUnavailableError('Failed to Welcome Mail');
  }
  return true; 
}

export {
  sendOtpByEmail,
  sendEmail,
  welcomeEmail 
}