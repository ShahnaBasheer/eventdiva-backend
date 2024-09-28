import { IEventPlannerBooking } from "./eventPlannerBooking.interface";
import { Icustomer, IcustomerDocument } from "./user.interface";
import { IVenueBooking } from "./venueBooking.interface";


interface ICustomerService {
    createUser(user: Icustomer): Promise<any>;
    comparePassword(enteredPassword: string, password: string): Promise<boolean>;
    getUserById(id: string): Promise<IcustomerDocument | null>;
    signupUser(user: Icustomer): Promise<boolean>;
    otpVerification(email: string, otp: string): Promise<boolean>;
    resendOTP(email: string): Promise<boolean>;
    loginUser(email: string, password: string): Promise<any>;
    verifyWithGoogle(idToken: string): Promise<any>;
    getCustomers(): Promise<Icustomer[]>;
    blockUser(id: string): Promise<Icustomer | null>;
    unblockUser(id: string): Promise<Icustomer | null>;
    extractUserData(user: IcustomerDocument): {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string; // Ensure this is a string type
        favorites: any[]; // Adjust this type as necessary
        bookings: any[]; // Adjust this type as necessary
        mobile?: string; // This can be optional
    };
    getAllBookings(customerId: string): Promise<(IVenueBooking | IEventPlannerBooking)[]>;
}


export default ICustomerService;