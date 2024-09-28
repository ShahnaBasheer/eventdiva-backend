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
const commonSchema_1 = require("./commonSchema");
const status_options_1 = require("../utils/status-options");
// Define the Charges Schema
const ChargesSchema = new mongoose_1.Schema({
    platformCharge: { type: Number, required: true, default: 50 },
    advancePayments: { type: Number },
    fullPayment: {
        type: {
            planningFee: { type: Number },
            servicesCharges: [{
                    service: { type: String, required: true },
                    cost: { type: Number, required: true }
                }],
        }
    }
});
const eventPlannerBookingSchema = new mongoose_1.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    eventPlannerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'EventPlanner',
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
    eventDate: {
        type: commonSchema_1.eventDateSchema,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
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
            message: 'At least one fee payment is required.'
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
const EventPlannerBooking = mongoose_1.default.model('EventPlannerBooking', eventPlannerBookingSchema);
exports.default = EventPlannerBooking;
