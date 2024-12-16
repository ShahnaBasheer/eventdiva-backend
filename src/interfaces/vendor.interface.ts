import { Schema, Document } from 'mongoose';

interface IVendor{
    firstName: string;
    lastName: string;
    email: string;
    vendorType: 'event-planner' | 'venue-vendor' | 'photographer' | 'food-vendor';
    role: string;
    serviceName?: string;
    mobile?: string;
}

interface IVendorData extends IVendor {
    password?: string;
    address?: Schema.Types.ObjectId;
    otp?: string;
    otpTimestamp?: Date;
    newotp?: string;
    newotpTimestamp?: Date;
    resetPasswordToken?: string
    resetPasswordExpires?: Date,
    isVerified?: boolean;
    isDeleted?: boolean;
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IVendorDocument extends IVendorData, Document {}

export { 
    IVendor, 
    IVendorData,
    IVendorDocument
};


