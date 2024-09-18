import { Document, Schema } from 'mongoose';
import { Status } from '../utils/status-options';


interface IRoom {
    count: number;
    roomStartingPrice: number;
}

interface IService {
    catering: boolean;
    decoration: boolean;
    alcohol: boolean;
}

interface IAvailableDate {
    startDate: Date;
    endDate: Date;
}

interface IPlatePrice {
    vegPerPlate?: number;
    nonVegPerPlate?: number;
}

interface ICapacity {
    totalSeats: number;
    totalFloats: number;
    areas: IArea[]; // Adjust if you have a specific type for `areas`
}

interface IArea {
    name: string; // The name of the area (e.g., "Main Hall", "Balcony")
    seats?: number; // Optional standing capacity
    floats?: number; // Optional capacity for floats
}


interface IVenue {
    vendorId: Schema.Types.ObjectId;
    slug: string;
    venueName: string;
    venueType: string;
    startYear: number;
    contact: {
        email: string;
        mobile: string;
    };
    address: Schema.Types.ObjectId;
    description: string;
    amenities: string[];
    rent: number;
    rooms?: IRoom;
    decorStartingPrice?: number;
    services: IService;
    platePrice?: IPlatePrice;
    availableDates?: IAvailableDate[];
    capacity: ICapacity;
    coverPic: string;
    portfolios: string[];
    rating?: number;
    reviews?: Schema.Types.ObjectId[];
    albums?: Schema.Types.ObjectId[];
    bookings?: Schema.Types.ObjectId[];
    document: string;
    approval: Status.Approved | Status.Pending | Status.Rejected;
    isDeleted?: boolean,
    createdAt?: Date;
    updatedAt?: Date;
}


interface IVenueDocument extends IVenue,Document {}

export {
    IVenue,
    IVenueDocument,
    IPlatePrice,
    ICapacity,
    IRoom,
    IService,
    IAvailableDate
};
