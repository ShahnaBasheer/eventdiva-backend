import mongoose, { Schema, Document } from "mongoose";
import { IEventPlannerDocument } from "../interfaces/eventPlanner.interface";
import { eventOptions } from "../utils/eventsVariables";


const eventPlannerSchema: Schema = new Schema<IEventPlannerDocument>(
    {
        vendorId: { 
            type: Schema.Types.ObjectId, 
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
            lowercase:true,
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
            enum: eventOptions,
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
            type: Schema.Types.ObjectId, 
            ref: 'Review' 
        }],
        albums: [{
            type: Schema.Types.ObjectId, 
            ref: 'Album',
        }],
        bookings: [{
            type: Schema.Types.ObjectId, 
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
            type: Schema.Types.ObjectId, 
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
    },
    { timestamps: true }  
);

const EventPlanner = mongoose.model<IEventPlannerDocument>('EventPlanner', eventPlannerSchema);

export default EventPlanner;




// policies: {
//     type: [{
//         name: { type: String, trim: true },
//         text: { type: String, required: true, trim: true }
//     }],
//     default: []
// },