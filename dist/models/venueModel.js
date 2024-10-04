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
const venueVariables_1 = require("../utils/venueVariables");
const status_options_1 = require("../utils/status-options");
// Define subschemas
const roomSchema = new mongoose_1.Schema({
    count: {
        type: Number,
        required: true
    },
    roomStartingPrice: {
        type: Number,
        required: true
    }
});
const availableDateSchema = new mongoose_1.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});
const platePriceSchema = new mongoose_1.Schema({
    vegPerPlate: { type: Number },
    nonVegPerPlate: { type: Number }
});
const capacitySchema = new mongoose_1.Schema({
    areaType: {
        type: String,
        enum: ['indoor', 'outdoor', 'indoor & outdoor'],
        required: true
    },
    areaName: { type: String, required: true },
    seats: { type: Number, required: true },
    floats: { type: Number, required: true },
});
// Main schema definition
const venueSchema = new mongoose_1.Schema({
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    venueName: {
        type: String,
        required: true
    },
    venueType: {
        type: String,
        required: true,
        enum: venueVariables_1.venueTypeValues
    },
    startYear: {
        type: Number,
        required: true,
    },
    coverPic: {
        type: String,
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
    address: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    description: {
        type: String,
        minlength: 100,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    platePrice: {
        type: platePriceSchema,
    },
    decorStartingPrice: {
        type: Number,
    },
    rooms: roomSchema,
    amenities: [{
            type: String,
            enum: venueVariables_1.venueAmenities,
            required: true,
            default: []
        }],
    services: [{
            type: String,
            enums: venueVariables_1.venueServices,
            required: true,
            default: []
        }],
    availableDates: [{
            type: availableDateSchema
        }],
    capacity: [{
            type: capacitySchema,
            required: true
        }],
    portfolios: [{
            type: String,
            required: true
        }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    reviews: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Review',
        }],
    albums: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Album',
        }],
    bookings: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Booking'
        }],
    document: {
        type: String,
        required: true
    },
    approval: {
        type: String,
        required: true,
        enum: [status_options_1.Status.Approved, status_options_1.Status.Pending, status_options_1.Status.Rejected],
        default: status_options_1.Status.Pending
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
// Adding indexes
venueSchema.index({ slug: 1 }, { unique: true });
venueSchema.index({ vendorId: 1 });
const Venue = mongoose_1.default.model('Venue', venueSchema);
exports.default = Venue;
