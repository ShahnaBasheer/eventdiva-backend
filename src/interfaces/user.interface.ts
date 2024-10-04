import { Schema, Document } from 'mongoose';


interface Icustomer{
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    googleId?: string;
    mobile?: string;
    address?: Schema.Types.ObjectId;
    favorites?: Schema.Types.ObjectId[];
    bookings?: Schema.Types.ObjectId[];
    otp?: string;
    otpTimestamp?: Date;
    newotp?: string;
    newotpTimestamp?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    role?: string;
    isVerified?: boolean;
    isPhoneVerified?: boolean;
    isDeleted?: boolean;
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


interface IcustomerDocument extends Icustomer, Document {}

export { 
    Icustomer, 
    IcustomerDocument 
};
