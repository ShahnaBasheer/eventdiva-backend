

import mongoose, { Schema } from 'mongoose';
import { IEventPlannerBookingDocument, Payment } from '../interfaces/eventPlannerBooking.interface';
import { eventOptions } from '../utils/eventsVariables';
import { eventDateSchema, paymentSchema } from './commonSchema';
import { Status } from '../utils/status-options';



// Define the Charges Schema
const ChargesSchema = new Schema({
    planningFee: { type: Number },
    platformCharge: { type: Number, required: true, default: 50 },
    advancePayments: { type: Number },
    servicesCharges: [{
        service: { type: String, required: true },
        cost: { type: Number, required: true }
    }],
    additionalFees: { type: Schema.Types.Mixed }
});


const eventPlannerBookingSchema: Schema = new Schema(
    {
        bookingId: { 
            type: String, 
            required: true,
            unique: true 
        },
        eventPlannerId: { 
            type: Schema.Types.ObjectId, 
            ref: 'EventPlanner', 
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
        eventDate: {
            type: eventDateSchema,
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
            type: [ paymentSchema ],
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

const EventPlannerBooking = mongoose.model<IEventPlannerBookingDocument>('EventPlannerBooking', eventPlannerBookingSchema);

export default EventPlannerBooking;
