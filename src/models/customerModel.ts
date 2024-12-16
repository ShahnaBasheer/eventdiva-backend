import  { ICustomerData, ICustomerDocument } from '../interfaces/customer.interface';
import mongoose, { Schema } from 'mongoose';


// Define the Customer schema
const customerSchema: Schema = new Schema(
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
            required: true,
            unique: true
        },
        mobile: {
            type: String,
            unique: true,
            sparse: true, // Allows this field to be optional and handle null values
        },
        address: {
            type: Schema.Types.ObjectId,
            ref: 'Address'
        },
        favorites: [{
            type: Schema.Types.ObjectId,
            ref: 'Favorite'
        }],
        password: {
            type: String,
            required: function(this: ICustomerData) {
                return !this.googleId; // Only required if googleId is not present
              },
              validate: {
                validator: function(this: ICustomerData, value: string) {
                  // If googleId is present, password can be optional
                  return this.googleId || value;
                },
                message: 'Password is required if Google ID is not present'
              }
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true // Allows this field to be optional
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
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        role: {
            type: String,
            default: 'customer',
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isPhoneVerified: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

// Middleware to check password requirement
customerSchema.pre('save', function(next) {
    if (!this.googleId && !this.password) {
      console.log('Password is required if Google ID is not present')
      const err = new Error('Password is required');
      next(err);
    } else {
      next();
    }
});



const Customer = mongoose.model<ICustomerDocument>('Customer', customerSchema);

export default Customer
