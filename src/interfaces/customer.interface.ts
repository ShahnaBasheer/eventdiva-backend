import { Schema, Document } from 'mongoose';

interface ICustomer {
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    role?: string;
}
interface ICustomerData extends ICustomer{
    password?: string;
    googleId?: string;
    address?: Schema.Types.ObjectId;
    favorites?: Schema.Types.ObjectId[];
    bookings?: Schema.Types.ObjectId[];
    otp?: string;
    otpTimestamp?: Date;
    newotp?: string;
    newotpTimestamp?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified?: boolean;
    isPhoneVerified?: boolean;
    isDeleted?: boolean;
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


interface ICustomerDocument extends ICustomerData, Document {}

export { 
    ICustomer, 
    ICustomerData,
    ICustomerDocument 
};
