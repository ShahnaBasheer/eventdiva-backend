"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emailSend_1 = require("../utils/emailSend");
const bcrypt_1 = __importDefault(require("bcrypt"));
const customError_1 = require("../errors/customError");
class CustomerService {
    constructor(customerRepository, _venueBookingRepository, _plannerBookingrepository) {
        this.customerRepository = customerRepository;
        this._venueBookingRepository = _venueBookingRepository;
        this._plannerBookingrepository = _plannerBookingrepository;
    }
    getAllBookings(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const venueBookings = yield this._venueBookingRepository.getBookings({ customerId });
                const eventPlannerBookings = yield this._plannerBookingrepository.getAllBookings({ customerId });
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
                const allBookings = [...venueBookings, ...eventPlannerBookings];
                // Sort the bookings by date, latest first
                const sortedBookings = allBookings.sort((a, b) => {
                    const dateA = new Date(a.eventDate.startDate).getTime(); // Adjust the field name if necessary
                    const dateB = new Date(b.eventDate.startDate).getTime(); // Adjust the field name if necessary
                    return dateB - dateA;
                });
                return sortedBookings;
            }
            catch (error) {
                throw new customError_1.BadRequestError(`Failed to retrieve bookings for customer: ${error.message}`);
            }
        });
    }
    getCustomer(id, vendorType) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield this.customerRepository.getById(id);
            return customer;
        });
    }
    updateCustomer(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedData = yield this.customerRepository.update({ _id: userId }, data);
            return updatedData;
        });
    }
    otpSendForUpdateEmail(user, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Validate the new email
                const existingVendor = yield this.customerRepository.getOneByFilter({ email });
                if (existingVendor) {
                    throw new customError_1.ConflictError('Email already in use');
                }
                // 3. Generate OTPs
                const oldEmailOtp = yield (0, emailSend_1.sendOtpByEmail)(user === null || user === void 0 ? void 0 : user.email);
                const newEmailOtp = yield (0, emailSend_1.sendOtpByEmail)(email);
                const customer = yield this.customerRepository.update({ _id: user.id }, { otp: oldEmailOtp, otpTimestamp: new Date(),
                    newotp: newEmailOtp, newotpTimestamp: new Date()
                });
                return customer;
            }
            catch (error) {
                console.error('Error updating customer email:', error);
                throw new customError_1.BadRequestError('Failed to send OTP! Try again later');
            }
        });
    }
    otpVerifyForEmail(user, formValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentTime = new Date();
                // Validate old OTP
                if (!(user === null || user === void 0 ? void 0 : user.otp) || !(user === null || user === void 0 ? void 0 : user.otpTimestamp) || (user === null || user === void 0 ? void 0 : user.otp) !== formValue.otpOld) {
                    throw new customError_1.BadRequestError(`Invalid OTP for ${user.email}`);
                }
                // Check if old OTP is expired
                const otpTimestamp = new Date(user === null || user === void 0 ? void 0 : user.otpTimestamp);
                const oldtimeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
                if (oldtimeDifferenceInMinutes > 2) {
                    throw new customError_1.BadRequestError(`OTP is Expired for ${user.email}`);
                }
                // Validate new OTP
                if (!(user === null || user === void 0 ? void 0 : user.newotp) || !(user === null || user === void 0 ? void 0 : user.newotpTimestamp) || (user === null || user === void 0 ? void 0 : user.newotp) !== formValue.otpNew) {
                    throw new customError_1.BadRequestError(`Invalid OTP for ${formValue.email}`);
                }
                // Check if new OTP is expired
                const newotpTimestamp = new Date(user === null || user === void 0 ? void 0 : user.newotpTimestamp);
                const newtimeDifferenceInMinutes = (currentTime.getTime() - newotpTimestamp.getTime()) / (1000 * 60);
                if (newtimeDifferenceInMinutes > 2) {
                    throw new customError_1.BadRequestError(`OTP is Expired for ${formValue.email}`);
                }
                // Update user in the database
                const detail = yield this.customerRepository.update({ email: user.email }, {
                    $set: { email: formValue.email },
                    $unset: { otpTimestamp: '', otp: '', newotpTimestamp: '', newotp: '' }
                });
                return detail; // Return success response
            }
            catch (error) {
                console.error("Error during OTP verification for email change:", error);
                throw error;
            }
        });
    }
    passwordChange(user, formValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (user.password) {
                    const isMatch = yield bcrypt_1.default.compare(formValue.currentPassword, user.password);
                    if (!isMatch) {
                        throw new customError_1.BadRequestError("Current password is incorrect.");
                    }
                    // Step 2: Ensure the new password and confirm new password match
                    if (formValue.newPassword !== formValue.confirmNewPassword) {
                        throw new customError_1.BadRequestError("New password and confirm password do not match.");
                    }
                }
                // Step 3: Hash the new password
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedNewPassword = yield bcrypt_1.default.hash(formValue.newPassword, salt);
                // Step 4: Update the password in the database
                const details = yield this.customerRepository.update({ _id: user._id }, {
                    $set: { password: hashedNewPassword }
                });
                // Step 5: Return success message
                return details;
            }
            catch (error) {
                console.error("Error changing password:", error);
                if (error instanceof customError_1.BadRequestError)
                    throw error;
                else
                    throw new customError_1.BadRequestError("Failed to change password. Please try again.");
            }
        });
    }
}
exports.default = CustomerService;
// private async createUser(user: ICustomerData): Promise<any> {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(user.password as string, salt);
//     return await this.customerRepository.create({ ...user, password: hashedPassword });
// }
// private async comparePassword(enteredPassword: string, password: string){
//     return await bcrypt.compare(enteredPassword, password);
// }
// async getUserById(id: string): Promise<ICustomerDocument | null>{
//     return await this.customerRepository.getById(id);
// }
// async signupUser(user: ICustomer): Promise<boolean> {
//     const existingUser = await this.customerRepository.getByEmail(user.email);
//     if (existingUser) {
//         if(existingUser?.isVerified){
//             throw new ConflictError("Email already exists");
//         } else {
//             await this.customerRepository.delete(existingUser.id!);
//         }
//     } 
//     const otp = await sendOtpByEmail(user?.email);
//     // Save OTP in database or in-memory store for verification
//     await this.createUser({ ...user, otp, otpTimestamp: new Date() });
//     return true;
// }
// async otpVerification(email: string, otp: string): Promise<boolean> {
//     const user = await this.customerRepository.getByEmail(email);
//     if(user && user?.isVerified) throw new ConflictError('User Already Exist!');
//     if (!user?.otp || !user?.otpTimestamp || user?.otp !== otp) {
//         throw new BadRequestError("Invalid OTP");
//     }
//     const currentTime = new Date();
//     const otpTimestamp = new Date(user?.otpTimestamp);
//     const timeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
//     if (timeDifferenceInMinutes > 2) throw new BadRequestError("OTP is Expired"); // OTP expired
//     // Update user in database
//     await this.customerRepository.update({email},  {
//         $set: { isVerified: true },
//         $unset: { otpTimestamp: '', otp: '' }
//     });
//     await welcomeEmail(email);
//     const notificationDocument = {
//         userId: user.id, 
//         userType: 'Customer', 
//         message: `Welcome to our platform! Your account has been created successfully.`, 
//         isRead: false,
//         notificationType: NotificationType.SIGNUP
//     };
//     await this._notificationrepository.create(notificationDocument);
//     return true;
// }
// async resendOTP(email: string): Promise<boolean> {
//     const user = await this.customerRepository.getByEmail(email);
//     if (user) {
//         if(user?.isVerified){
//             throw new ConflictError('User is already verified');
//         }   
//     } else {
//         throw new UnauthorizedError('User not found')
//     }
//     const otp = await sendOtpByEmail(user?.email);
//     await this.customerRepository.update({ email },  {
//         $set: { otp , otpTimestamp: new Date() },
//     });
//     return true;
// }
// async loginUser(email: string, password: string): Promise<any>{
//     const user = await this.customerRepository.getOneByFilter({email });
//     if(user && user?.isBlocked) throw new ForbiddenError('User account is blocked');
//     if(user && user?.isVerified && user?.password && await this.comparePassword(password, user?.password)){
//         const accessToken = generateCustomerToken(user.id!, user.role!)
//         const refreshToken = generateRefreshCustomerToken(user.id!, user.role!)
//         const customer = this.extractUserData(user);
//         return { accessToken, refreshToken, customer };
//     } else {
//         throw new UnauthorizedError('Invalid email or password') 
//     }
// }
// async getCustomers(
//     page: number,
//     limit: number
//   ): Promise<{ customers: ICustomer[]; totalCount: number, totalPages: number }> {
//     try {
//       const skip = (page - 1) * limit;
//       let filterQuery: Record<string, any> = {}; // Add your custom filter logic here
//       const pipeline = [
//         {
//           $match: filterQuery, // Match your filter query first
//         },
//         {
//           $lookup: {
//             from: 'addresses', // Join with 'addresses' collection
//             localField: 'address',
//             foreignField: '_id',
//             as: 'address',
//           },
//         },
//         {
//           $facet: {
//             customers: [
//               { $skip: skip }, // Skip the documents based on the page number
//               { $limit: limit }, // Limit the number of documents returned
//               {
//                 $project: {
//                   firstName: 1,
//                   lastName: 1,
//                   address: 1,
//                   role: 1,
//                   email: 1,
//                   mobile: 1,
//                   isVerified: 1,
//                   isBlocked: 1,
//                   createdAt: 1,
//                 },
//               },
//             ],
//             totalCount: [
//               { $count: 'count' }, // Count total documents matching the query
//             ],
//           },
//         },
//       ];
//       // Execute the aggregation pipeline
//       const result = await this.customerRepository.getAggregateData(pipeline) ?? [];
//       // Extract customers and totalCount from the result
//       const customers = result[0]?.customers || [];
//       const totalCount = result[0]?.totalCount[0]?.count || 0; // Ensure default value in case it's missing
//       const totalPages = Math.ceil(totalCount/ limit);
//       console.log(customers)
//       return { customers, totalCount, totalPages };
//     } catch (error) {
//       console.error('Error fetching paginated customers:', error);
//       throw error;
//     }
// }
// async blockUser(id: string): Promise<ICustomer | null> {
//     return await this.customerRepository.block(id);
// }
// async unblockUser(id: string): Promise<ICustomer | null> {
//     return await this.customerRepository.unblock(id);
// }
// extractUserData(user: ICustomerDocument){
//     const extracted = {
//         id: user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         favorites: [],
//         bookings: [],
//         ...(user?.mobile && { mobile: user.mobile })
//     };
//     return extracted;
// }
