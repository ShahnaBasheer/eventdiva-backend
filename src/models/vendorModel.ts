
import { IVendorDocument, IVendor } from '../interfaces/vendor.interface';
import mongoose, { Schema } from 'mongoose';



const vendorSchema: Schema = new Schema<IVendor>(
    {
        firstName: {       
            type: String, 
            required: true 
        },
        lastName: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true 
        },
        mobile: { 
            type: String, 
        },
        vendorType: {
            type: String,
            required: true,
            enum: ['event-planner', 'venue-vendor', 'photographer', 'food-vendor']
        },
        password: { 
            type: String, 
            required: true 
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        role: {
            type: String,
            default: 'vendor',
            required: true,
        },
        otp: {
            type: String
        },
        otpTimestamp: {
            type: Date
        },
        newotp: {
            type: String
        },
        newotpTimestamp: {
            type: Date
        },
        isVerified: {
            type: Boolean,
            default: false,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            required: true,
        },
        isBlocked: {
            type: Boolean,
            default: false,
            required: true,
        },
    }, {    timestamps: true }
);

const Vendor = mongoose.model<IVendorDocument>('Vendor', vendorSchema);

export default Vendor;
