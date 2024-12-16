import { IEventPlannerBooking } from "./eventPlannerBooking.interface";
import { ICustomer, ICustomerDocument } from "./customer.interface";
import { IVenueBooking } from "./venueBooking.interface";


interface ICustomerService {
    createUser(user: ICustomer): Promise<any>;
    comparePassword(enteredPassword: string, password: string): Promise<boolean>;
    getUserById(id: string): Promise<ICustomerDocument | null>;
    signupUser(user: ICustomer): Promise<boolean>;
    otpVerification(email: string, otp: string): Promise<boolean>;
    resendOTP(email: string): Promise<boolean>;
    loginUser(email: string, password: string): Promise<any>;
    verifyWithGoogle(idToken: string): Promise<any>;
    getCustomers(): Promise<ICustomer[]>;
    blockUser(id: string): Promise<ICustomer | null>;
    unblockUser(id: string): Promise<ICustomer | null>;
    extractUserData(user: ICustomerDocument): {
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