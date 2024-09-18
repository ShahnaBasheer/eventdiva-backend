import { Schema, Document } from 'mongoose';


interface IVendor {
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    vendorType: 'event-planner' | 'venue-vendor' | 'photographer' | 'food-vendor';
    password?: string;
    address?: Schema.Types.ObjectId;
    role?: string;
    serviceName?: string;
    otp?: string;
    otpTimestamp?: Date;
    isVerified?: boolean;
    isDeleted?: boolean;
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IVendorDocument extends IVendor, Document {}

export { 
    IVendor, 
    IVendorDocument
};


