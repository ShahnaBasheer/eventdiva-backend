
import { Schema, Document } from 'mongoose';
import { Status } from '../utils/status-options';

interface IVenueBooking {
    bookingId: string;
    venueId: Schema.Types.ObjectId;
    customerId: Schema.Types.ObjectId;
    rooms: number;
    areasBooked?: AreaBooked[];
    eventType: string;
    eventName: string;
    isMultipleDays: boolean;
    servicesRequested?: string[];
    guests: number;
    totalCost: number;
    contact: {
        email: string;
        mobile: string;
    };
    status?: Status.Pending| Status.Confirmed| Status.Cancelled| Status.Completed;
    address: Schema.Types.ObjectId;
    payments: Payment[];
    paymentStatus?:  Status.Pending| Status.Paid| Status.Cancelled| Status.Failed | Status.Advance | Status.Partially_Refunded | Status.Refunded;
    charges?: Charges;
    reason?: string;
    additionalNeeds?: string;
    notes?: string;
    eventDate: EventDate;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
 

// interface Room {
//     count: number;
//     totalPrice: number;
// }

interface AreaBooked {
    areaType: 'indoor'| 'outdoor'| 'indoor & outdoor';
    areaName: string;
}

interface Service {
    cost: number;
    service: string;
}

interface Charges {
    platformCharge: number;
    advancePayments?: number; 
    fullPayment?: {
        venueRental?: number;
        servicesCharges: Service[], 
    }
}

interface EventDate {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
}


interface Payment {
    type: 'Platform Fee' | 'Advance Payment' | 'Full Payment';
    amount: number;
    status?: Status.Pending | Status.Paid | Status.Failed | Status.Cancelled;
    mode: 'Razorpay'; // You can extend this if you add more payment modes
    paymentInfo: any; // Replace 'any' with a more specific type if known
}

interface IVenueBookingDocument extends Document, IVenueBooking {}

export {
    IVenueBookingDocument, IVenueBooking, Payment 
};
