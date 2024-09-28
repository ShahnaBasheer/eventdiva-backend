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
const eventsVariables_1 = require("../utils/eventsVariables");
const venueVariables_1 = require("../utils/venueVariables");
const commonSchema_1 = require("./commonSchema");
const status_options_1 = require("../utils/status-options");
// Define the Charges Schema
const ChargesSchema = new mongoose_1.Schema({
    platformCharge: { type: Number, required: true, default: 50 },
    advancePayments: { type: Number },
    fullPayment: {
        type: {
            venueRental: { type: Number },
            servicesCharges: [{
                    service: { type: String, required: true },
                    cost: { type: Number, required: true }
                }],
        }
    }
});
const venueBookingSchema = new mongoose_1.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    venueId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: eventsVariables_1.eventOptions
    },
    eventName: {
        type: String,
        required: true
    },
    isMultipleDays: {
        type: Boolean,
        required: true
    },
    servicesRequested: [{
            type: String,
            enum: venueVariables_1.venueServices
        }],
    rooms: {
        type: Number,
    },
    areasBooked: [{
            areaType: {
                type: String,
                enum: ['indoor', 'outdoor', 'indoor & outdoor'],
                required: true
            },
            areaName: { type: String, required: true }
        }],
    guests: {
        type: Number,
        required: true
    },
    eventDate: {
        type: commonSchema_1.eventDateSchema,
        required: true
    },
    totalCost: {
        type: Number,
        require: true
    },
    address: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    contact: {
        email: {
            type: String,
            required: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        }
    },
    payments: {
        type: [commonSchema_1.paymentSchema],
        requred: true,
        validate: {
            validator: function (payments) {
                const hasPlatformFee = payments.some((payment) => payment.type === 'Platform Fee');
                return hasPlatformFee; // Ensure at least one platform fee payment is included
            },
            message: 'At least one platform fee payment is required.'
        }
    },
    charges: {
        type: ChargesSchema,
    },
    additionalNeeds: {
        type: String
    },
    notes: {
        type: String
    },
    reason: { type: String },
    status: {
        type: String,
        enum: [status_options_1.Status.Pending, status_options_1.Status.Confirmed, status_options_1.Status.Cancelled, status_options_1.Status.Completed],
        required: true,
        default: status_options_1.Status.Pending
    },
    paymentStatus: {
        type: String,
        enum: [status_options_1.Status.Pending, status_options_1.Status.Paid, status_options_1.Status.Cancelled, status_options_1.Status.Failed, status_options_1.Status.Advance, status_options_1.Status.Partially_Refunded, status_options_1.Status.Refunded],
        required: true,
        default: status_options_1.Status.Pending
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
// Custom validation for eventDate
venueBookingSchema.pre('validate', function (next) {
    if (this.eventDate.startDate > this.eventDate.endDate) {
        this.invalidate('eventDate.endDate', 'End date must be after start date');
    }
    next();
});
venueBookingSchema.index({ vendorId: 1 });
venueBookingSchema.index({ customerId: 1 });
const VenueBooking = mongoose_1.default.model('VenueBooking', venueBookingSchema);
exports.default = VenueBooking;
