
import { Schema, Document, Types } from 'mongoose';
import { Status } from '../utils/status-options';


interface IEventPlannerBooking {
    bookingId: string;
    eventPlannerId: Types.ObjectId;
    customerId: Schema.Types.ObjectId;
    eventType: string;
    eventName: string;
    isMultipleDays: boolean;
    guests: number;
    totalCost: number;
    contact: {
        email: string;
        mobile: string;
    };
    status?:  Status.Pending| Status.Confirmed | Status.Cancelled| Status.Completed;
    address: Schema.Types.ObjectId;
    paymentStatus?: Status.Pending| Status.Paid | Status.Cancelled| Status.Failed | Status.Advance | Status.Partially_Refunded | Status.Refunded;
    charges?: Charges;
    reason?: string;
    additionalNeeds?: string;
    notes?: string;
    eventDate: EventDate;
    payments: Payment[];
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


interface EventDate {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
}

interface Service {
    cost: number;
    service: string;
}

interface Charges {
    platformCharge: number;
    planningFee?: number;
    advancePayments?: number; 
    servicesCharges?: Service[],
    additionalFees?: any; 
}

interface Payment {
    type: 'Platform Fee' | 'Advance Payment' | 'Full Payment';
    amount: number;
    status?: Status.Pending | Status.Paid | Status.Failed | Status.Cancelled;
    mode: 'Razorpay'; // You can extend this if you add more payment modes
    paymentInfo: any; // Replace 'any' with a more specific type if known
}


interface IEventPlannerBookingDocument extends Document, IEventPlannerBooking {}

export {
    IEventPlannerBooking,
    IEventPlannerBookingDocument,
    Payment 

}
