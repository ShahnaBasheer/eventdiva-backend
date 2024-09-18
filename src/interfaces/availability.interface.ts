import { Schema, Document, Types } from 'mongoose';




// Slot interface
interface Slot {
    startTime: string;
    endTime: string;
    isExternal: boolean;
    bookingId?: string;
    externalBookingDetails?: {
        customerName?: string;
        eventDetails?: string;
        place?: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

// Availability interface
interface IAvailability  {
    vendorId: Types.ObjectId;
    maxEvents: number;
    bookingType: 'VenueBooking' | 'EventPlannerBooking';
    bookedDates: {
        date: Date;
        slots: Slot[];
    }[];
    holyDays: Date[];
    createdAt?: Date;
    updatedAt?: Date;
}


interface IAvailabilityDocument extends Document, IAvailability {}


export{
    Slot,
    IAvailability,
    IAvailabilityDocument

}