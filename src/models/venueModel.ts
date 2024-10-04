import mongoose, { Schema } from "mongoose";
import { IVenueDocument } from "../interfaces/venue.interface";
import { venueAmenities, venueServices, venueTypeValues } from "../utils/venueVariables";
import { Status } from '../utils/status-options';


// Define subschemas
const roomSchema = new Schema({
    count: { 
        type: Number, 
        required: true 
    },
    roomStartingPrice: { 
        type: Number, 
        required: true 
    }
});



const availableDateSchema = new Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

const platePriceSchema = new Schema({
    vegPerPlate: { type: Number },
    nonVegPerPlate: { type: Number }
});

const capacitySchema = new Schema({
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
const venueSchema: Schema = new Schema<IVenueDocument>(
    {
        vendorId: { 
            type: Schema.Types.ObjectId, 
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
            enum: venueTypeValues
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
            type: Schema.Types.ObjectId, 
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
            enum: venueAmenities,
            required: true ,
            default: []
        }],
        services: [{
            type: String,
            enums: venueServices,
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
            type: Schema.Types.ObjectId, 
            ref: 'Review', 
        }],
        albums: [{
            type: Schema.Types.ObjectId, 
            ref: 'Album',
        }],
        bookings: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'Booking' 
        }],
        document: {
            type: String, 
            required: true 
        },
        approval: {
            type: String, 
            required: true,
            enum: [Status.Approved, Status.Pending, Status.Rejected],
            default: Status.Pending 
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Adding indexes
venueSchema.index({ slug: 1 }, { unique: true });
venueSchema.index({ vendorId: 1 });



const Venue = mongoose.model<IVenueDocument>('Venue', venueSchema);

export default Venue;



















