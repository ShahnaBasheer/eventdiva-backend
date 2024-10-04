"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define the Customer schema
const customerSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Address'
    },
    favorites: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Favorite'
        }],
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Only required if googleId is not present
        },
        validate: {
            validator: function (value) {
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
}, {
    timestamps: true
});
// Middleware to check password requirement
customerSchema.pre('save', function (next) {
    if (!this.googleId && !this.password) {
        console.log('Password is required if Google ID is not present');
        const err = new Error('Password is required');
        next(err);
    }
    else {
        next();
    }
});
const Customer = mongoose_1.default.model('Customer', customerSchema);
exports.default = Customer;
