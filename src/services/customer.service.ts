import CustomerRepository from "../repositories/customer.repository";
import { sendOtpByEmail, welcomeEmail } from "../utils/emailSend";
import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from "../errors/customError";
import { generateCustomerToken, generateRefreshCustomerToken } from "../config/jwToken";
import { OAuth2Client } from 'google-auth-library';
import { Icustomer, IcustomerDocument } from "../interfaces/user.interface";
import Customer from "../models/customerModel";
import VenueBookingRepository from "../repositories/venueBooking.repository";
import PlannerBookingRepository from "../repositories/plannerBooking.repository";
import NotificationRepository from "../repositories/notification.repository";
import { NotificationType } from "../utils/eventsVariables";





class CustomerService {
    private customerRepository!: CustomerRepository;
    private _venueBookingRepository!: VenueBookingRepository;
    private _plannerBookingrepository: PlannerBookingRepository;
    private _notificationrepository: NotificationRepository;

    constructor() {
        this.customerRepository = new CustomerRepository();
        this._venueBookingRepository = new VenueBookingRepository();
        this._plannerBookingrepository = new PlannerBookingRepository();
        this._notificationrepository = new NotificationRepository();
    }
    

    private async createUser(user: Icustomer): Promise<any> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password as string, salt);
        return await this.customerRepository.create({ ...user, password: hashedPassword });
    }

    private async comparePassword(enteredPassword: string, password: string){
        return await bcrypt.compare(enteredPassword, password);
    }

    async getUserById(id: string): Promise<IcustomerDocument | null>{
        return await this.customerRepository.getById(id);
    }

    async signupUser(user: Icustomer): Promise<boolean> {
        const existingUser = await this.customerRepository.getByEmail(user.email);

        if (existingUser) {
            if(existingUser?.isVerified){
                throw new ConflictError("Email already exists");
            } else {
                await this.customerRepository.delete(existingUser.id!);
            }
        } 
        const otp = await sendOtpByEmail(user?.email);
        // Save OTP in database or in-memory store for verification
        await this.createUser({ ...user, otp, otpTimestamp: new Date() });
        
        return true;
    }

    async otpVerification(email: string, otp: string): Promise<boolean> {
        const user = await this.customerRepository.getByEmail(email);
        
        if(user && user?.isVerified) throw new ConflictError('User Already Exist!');
        
        if (!user?.otp || !user?.otpTimestamp || user?.otp !== otp) {
            throw new BadRequestError("Invalid OTP");
        }

        const currentTime = new Date();
        const otpTimestamp = new Date(user?.otpTimestamp);
        const timeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
        
        if (timeDifferenceInMinutes > 2) throw new BadRequestError("OTP is Expired"); // OTP expired
        
        // Update user in database
        await this.customerRepository.update({email},  {
            $set: { isVerified: true },
            $unset: { otpTimestamp: '', otp: '' }
        });
        
        await welcomeEmail(email);

        const notificationDocument = {
            userId: user.id, 
            userType: 'Customer', 
            message: `Welcome to our platform! Your account has been created successfully.`, 
            isRead: false,
            notificationType: NotificationType.SIGNUP
        };

        await this._notificationrepository.create(notificationDocument);
        return true;
    }


    async resendOTP(email: string): Promise<boolean> {
        const user = await this.customerRepository.getByEmail(email);
      
        if (user) {
            if(user?.isVerified){
                throw new ConflictError('User is already verified');
            }   
        } else {
            throw new UnauthorizedError('User not found')
        }
        const otp = await sendOtpByEmail(user?.email);
        await this.customerRepository.update({ email },  {
            $set: { otp , otpTimestamp: new Date() },
        });
        return true;
    }


    async loginUser(email: string, password: string): Promise<any>{
        const user = await this.customerRepository.getOneByFilter({email });
        
        if(user && user?.isBlocked) throw new ForbiddenError('User account is blocked');

        if(user && user?.isVerified && user?.password && await this.comparePassword(password, user?.password)){
            const accessToken = generateCustomerToken(user.id!, user.role!)
            const refreshToken = generateRefreshCustomerToken(user.id!, user.role!)
            const customer = this.extractUserData(user);
            return { accessToken, refreshToken, customer };
        } else {
            throw new UnauthorizedError('Invalid email or password') 
        }
    }

    
    async verifyWithGoogle(idToken: string) { 
        try {
            const client = new OAuth2Client(process.env.GOOGLE_ID);   
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_ID,
            });
            const payload = ticket.getPayload();
    
            if (!payload) {
                throw new BadRequestError('Invalid payload received from Google authentication');
            }
    
            const { sub, given_name, family_name, email } = payload;
            let user = await this.customerRepository.getOneByFilter({ googleId: sub});

            if (user && user.isBlocked) {
                throw new ForbiddenError('User account is blocked');
            }

            if (!user) {
                
                if (given_name && email) {
                    // Convert the plain object to a Mongoose document
                    const userDocument = {
                        googleId: sub,
                        firstName: given_name,
                        lastName: family_name || '',
                        email,
                        isVerified: true, 
                    };
            
                    user = await this.customerRepository.create(userDocument);
                    await welcomeEmail(email);

                    const notificationDocument = {
                        userId: user.id, 
                        userType: 'Customer', 
                        message: `Welcome to our platform! Your account has been created successfully.`, 
                        isRead: false,
                        notificationType: NotificationType.SIGNUP
                    };
            
                    await this._notificationrepository.create(notificationDocument);
                } else {
                    throw new BadRequestError('Missing required fields for user creation');
                }
            }
    
            const accessToken = generateCustomerToken(user.id!, user.role!);
            const refreshToken = generateRefreshCustomerToken(user.id!, user.role!);
    
            return { accessToken, refreshToken, customer: this.extractUserData(user) };   
        } catch (error) {
            console.log(error, 'Error occur during google authentication');
            if(error instanceof ForbiddenError || error instanceof BadRequestError) throw error;
            throw new UnauthorizedError('Authentication failed');
        }
    }
    

    async getCustomers(): Promise<Icustomer[]> {
        return await this.customerRepository.getAllWithPopuate({});
    }

    async blockUser(id: string): Promise<Icustomer | null> {
        return await this.customerRepository.block(id);
    }

    async unblockUser(id: string): Promise<Icustomer | null> {
        return await this.customerRepository.unblock(id);
    }

    
    extractUserData(user: IcustomerDocument){
        const extracted = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            favorites: [],
            bookings: [],
            ...(user?.mobile && { mobile: user.mobile })
        };
        return extracted;
    }

    async getAllBookings(customerId: string){
        try {
            const venueBookings = await this._venueBookingRepository.getBookings({ customerId });
            const eventPlannerBookings = await this._plannerBookingrepository.getAllBookings({ customerId });

            // Add a vendor field to each booking
            // const venueBookingsWithVendor = venueBookings.map(booking => ({
            //     ...booking,
            //     vendor: 'venue'
            // }));
        
            // const eventPlannerBookingsWithVendor = eventPlannerBookings.map(booking => ({
            //     ...booking,
            //     vendor: 'event-planner'
            // }));

            // Combine the results from both collections
            const allBookings = [...venueBookings, ...eventPlannerBookings ];

            // Sort the bookings by date, latest first
            const sortedBookings = allBookings.sort((a, b) => {
                const dateA = new Date(a.eventDate.startDate).getTime(); // Adjust the field name if necessary
                const dateB = new Date(b.eventDate.startDate).getTime(); // Adjust the field name if necessary
                return dateB - dateA;
            });

            
            return sortedBookings;
        } catch (error: any) {
            throw new BadRequestError(`Failed to retrieve bookings for customer: ${error.message}`);
        }
    }

  
}



export default CustomerService;
