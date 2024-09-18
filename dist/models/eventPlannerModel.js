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
const eventPlannerSchema = new mongoose_1.Schema({
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
        unique: true,
        required: true
    },
    company: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    coverPic: {
        type: String,
        required: true
    },
    startYear: {
        type: Number,
        required: true
    },
    contact: {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true, // Ensures unique email address
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        }
    },
    services: [{
            type: String,
            enum: eventsVariables_1.eventOptions,
            required: true,
        }],
    description: {
        type: String,
        required: true,
        minlength: 100, // Encourages a more detailed description
    },
    portfolios: [{
            type: String,
            required: true
        }],
    reviews: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Review'
        }],
    albums: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Album',
        }],
    bookings: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Booking'
        }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    planningFee: {
        minPrice: { type: Number, required: true },
        maxPrice: { type: Number, required: true }
    },
    address: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    plannedCities: [{
            type: String,
            required: true
        }],
    document: {
        type: String,
        required: true
    },
    approval: {
        type: String,
        required: true,
        enum: ["approved", "pending", "rejected"],
        default: "pending"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const EventPlanner = mongoose_1.default.model('EventPlanner', eventPlannerSchema);
exports.default = EventPlanner;
// policies: {
//     type: [{
//         name: { type: String, trim: true },
//         text: { type: String, required: true, trim: true }
//     }],
//     default: []
// },
