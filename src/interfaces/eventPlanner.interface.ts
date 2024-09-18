import { Document, Schema, Types } from "mongoose";


type EventServiceOption =
    | "Wedding Events"
    | "Corporate Events"
    | "Social Events"
    | "Themed Parties"
    | "Destination Events"
    | "Festivals"
    | "Concerts and Live Performances"
    | "Trade Shows and Exhibitions"
    | "Fundraisers and Charity Events"
    | "Conferences and Seminars"
    | "Product Launches"
    | "Award Ceremonies"
    | "Birthday Parties"
    | "Anniversaries"
    | "Sporting Events"
    | "Community Events"
    | "School and University Events"
    | "Religious Celebrations"
    | "Holiday Parties"
    | "General Event Planning";



interface IEventPlanner{
    vendorId: Schema.Types.ObjectId;
    contact: {
        email: string;
        mobile: string;
    };
    website?: string;
    company: string;
    slug?: string;
    startYear: number;
    services?: EventServiceOption[];
    description: string;
    coverPic: string;
    portfolios: string[];
    document: string;
    reviews?: Schema.Types.ObjectId[];
    albums?: Schema.Types.ObjectId[];
    bookings?: Schema.Types.ObjectId[];
    rating?: number;
    planningFee: {
        minPrice: number;
        maxPrice: number;
    };
    address: Schema.Types.ObjectId;
    plannedCities: string[];
    approval?: "Approved"| "Pending"| "Rejected";
    isDeleted?: boolean,
    createdAt?: Date;
    updatedAt?: Date;
}


// policies: {
//     name: string;
//     text: string;
// }[];



interface IEventPlannerDocument extends Document, IEventPlanner {}

export {
    IEventPlanner,
    IEventPlannerDocument,
};


