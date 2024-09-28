import mongoose, { Schema } from "mongoose";
import { IVenueBookingDocument, Payment } from "../interfaces/venueBooking.interface";
import { eventOptions } from "../utils/eventsVariables";
import { venueServices } from "../utils/venueVariables";
import { eventDateSchema, paymentSchema } from "./commonSchema";
import { Status } from "../utils/status-options";



// Define the Charges Schema
const ChargesSchema = new Schema({
    platformCharge: { type: Number, required: true, default: 50 },
    advancePayments: { type: Number },
    fullPayment: { 
        type:  {
            venueRental: { type: Number },
            servicesCharges: [{
                service: { type: String, required: true },
                cost: { type: Number, required: true }
            }],
        }
    }  
});



const venueBookingSchema: Schema = new Schema<IVenueBookingDocument>(
    {
        bookingId: { 
            type: String, 
            required: true,
            unique: true 
        },
        venueId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Venue', 
            required: true 
        },
        customerId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Customer', 
            required: true 
        },
        eventType: {
            type: String,
            required: true,
            enum: eventOptions
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
            enum: venueServices
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
            type: eventDateSchema,
            required: true
        },
        totalCost: { 
            type: Number, 
            require: true
        },
        address: { 
            type: Schema.Types.ObjectId, 
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
            type: [paymentSchema],
            requred: true,
            validate: {
                validator: function (payments: Payment[]) {
                  const hasPlatformFee = payments.some((payment: Payment) => payment.type === 'Platform Fee');
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
            enum: [Status.Pending, Status.Confirmed, Status.Cancelled, Status.Completed], 
            required: true ,
            default: Status.Pending
        },
        paymentStatus: { 
            type: String,
            enum: [Status.Pending, Status.Paid, Status.Cancelled, Status.Failed , Status.Advance , Status.Partially_Refunded , Status.Refunded], 
            required: true,
            default: Status.Pending 
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Custom validation for eventDate
venueBookingSchema.pre('validate', function(this: IVenueBookingDocument, next) {
    if (this.eventDate.startDate > this.eventDate.endDate) {
        this.invalidate('eventDate.endDate', 'End date must be after start date');
    }
    next();
});


venueBookingSchema.index({ vendorId: 1 });
venueBookingSchema.index({ customerId: 1 });


const VenueBooking = mongoose.model<IVenueBookingDocument>('VenueBooking', venueBookingSchema);

export default VenueBooking;
