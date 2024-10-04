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
const customer_repository_1 = __importDefault(require("../repositories/customer.repository"));
const emailSend_1 = require("../utils/emailSend");
const bcrypt_1 = __importDefault(require("bcrypt"));
const customError_1 = require("../errors/customError");
const jwToken_1 = require("../config/jwToken");
const google_auth_library_1 = require("google-auth-library");
const venueBooking_repository_1 = __importDefault(require("../repositories/venueBooking.repository"));
const plannerBooking_repository_1 = __importDefault(require("../repositories/plannerBooking.repository"));
const notification_repository_1 = __importDefault(require("../repositories/notification.repository"));
const eventsVariables_1 = require("../utils/eventsVariables");
class CustomerService {
    constructor() {
        this.customerRepository = new customer_repository_1.default();
        this._venueBookingRepository = new venueBooking_repository_1.default();
        this._plannerBookingrepository = new plannerBooking_repository_1.default();
        this._notificationrepository = new notification_repository_1.default();
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
            return yield this.customerRepository.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        });
    }
    comparePassword(enteredPassword, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(enteredPassword, password);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.getById(id);
        });
    }
    signupUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.customerRepository.getByEmail(user.email);
            if (existingUser) {
                if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.isVerified) {
                    throw new customError_1.ConflictError("Email already exists");
                }
                else {
                    yield this.customerRepository.delete(existingUser.id);
                }
            }
            const otp = yield (0, emailSend_1.sendOtpByEmail)(user === null || user === void 0 ? void 0 : user.email);
            // Save OTP in database or in-memory store for verification
            yield this.createUser(Object.assign(Object.assign({}, user), { otp, otpTimestamp: new Date() }));
            return true;
        });
    }
    otpVerification(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.customerRepository.getByEmail(email);
            if (user && (user === null || user === void 0 ? void 0 : user.isVerified))
                throw new customError_1.ConflictError('User Already Exist!');
            if (!(user === null || user === void 0 ? void 0 : user.otp) || !(user === null || user === void 0 ? void 0 : user.otpTimestamp) || (user === null || user === void 0 ? void 0 : user.otp) !== otp) {
                throw new customError_1.BadRequestError("Invalid OTP");
            }
            const currentTime = new Date();
            const otpTimestamp = new Date(user === null || user === void 0 ? void 0 : user.otpTimestamp);
            const timeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
            if (timeDifferenceInMinutes > 2)
                throw new customError_1.BadRequestError("OTP is Expired"); // OTP expired
            // Update user in database
            yield this.customerRepository.update({ email }, {
                $set: { isVerified: true },
                $unset: { otpTimestamp: '', otp: '' }
            });
            yield (0, emailSend_1.welcomeEmail)(email);
            const notificationDocument = {
                userId: user.id,
                userType: 'Customer',
                message: `Welcome to our platform! Your account has been created successfully.`,
                isRead: false,
                notificationType: eventsVariables_1.NotificationType.SIGNUP
            };
            yield this._notificationrepository.create(notificationDocument);
            return true;
        });
    }
    resendOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.customerRepository.getByEmail(email);
            if (user) {
                if (user === null || user === void 0 ? void 0 : user.isVerified) {
                    throw new customError_1.ConflictError('User is already verified');
                }
            }
            else {
                throw new customError_1.UnauthorizedError('User not found');
            }
            const otp = yield (0, emailSend_1.sendOtpByEmail)(user === null || user === void 0 ? void 0 : user.email);
            yield this.customerRepository.update({ email }, {
                $set: { otp, otpTimestamp: new Date() },
            });
            return true;
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.customerRepository.getOneByFilter({ email });
            if (user && (user === null || user === void 0 ? void 0 : user.isBlocked))
                throw new customError_1.ForbiddenError('User account is blocked');
            if (user && (user === null || user === void 0 ? void 0 : user.isVerified) && (user === null || user === void 0 ? void 0 : user.password) && (yield this.comparePassword(password, user === null || user === void 0 ? void 0 : user.password))) {
                const accessToken = (0, jwToken_1.generateCustomerToken)(user.id, user.role);
                const refreshToken = (0, jwToken_1.generateRefreshCustomerToken)(user.id, user.role);
                const customer = this.extractUserData(user);
                return { accessToken, refreshToken, customer };
            }
            else {
                throw new customError_1.UnauthorizedError('Invalid email or password');
            }
        });
    }
    verifyWithGoogle(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_ID);
                const ticket = yield client.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_ID,
                });
                const payload = ticket.getPayload();
                if (!payload) {
                    throw new customError_1.BadRequestError('Invalid payload received from Google authentication');
                }
                const { sub, given_name, family_name, email } = payload;
                let user = yield this.customerRepository.getOneByFilter({ googleId: sub });
                if (user && user.isBlocked) {
                    throw new customError_1.ForbiddenError('User account is blocked');
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
                        user = yield this.customerRepository.create(userDocument);
                        yield (0, emailSend_1.welcomeEmail)(email);
                        const notificationDocument = {
                            userId: user.id,
                            userType: 'Customer',
                            message: `Welcome to our platform! Your account has been created successfully.`,
                            isRead: false,
                            notificationType: eventsVariables_1.NotificationType.SIGNUP
                        };
                        yield this._notificationrepository.create(notificationDocument);
                    }
                    else {
                        throw new customError_1.BadRequestError('Missing required fields for user creation');
                    }
                }
                const accessToken = (0, jwToken_1.generateCustomerToken)(user.id, user.role);
                const refreshToken = (0, jwToken_1.generateRefreshCustomerToken)(user.id, user.role);
                return { accessToken, refreshToken, customer: this.extractUserData(user) };
            }
            catch (error) {
                console.log(error, 'Error occur during google authentication');
                if (error instanceof customError_1.ForbiddenError || error instanceof customError_1.BadRequestError)
                    throw error;
                throw new customError_1.UnauthorizedError('Authentication failed');
            }
        });
    }
    getCustomers(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const skip = (page - 1) * limit;
                let filterQuery = {}; // Add your custom filter logic here
                const pipeline = [
                    {
                        $match: filterQuery, // Match your filter query first
                    },
                    {
                        $lookup: {
                            from: 'addresses', // Join with 'addresses' collection
                            localField: 'address',
                            foreignField: '_id',
                            as: 'address',
                        },
                    },
                    {
                        $facet: {
                            customers: [
                                { $skip: skip }, // Skip the documents based on the page number
                                { $limit: limit }, // Limit the number of documents returned
                                {
                                    $project: {
                                        firstName: 1,
                                        lastName: 1,
                                        address: 1,
                                        role: 1,
                                        email: 1,
                                        mobile: 1,
                                        isVerified: 1,
                                        isBlocked: 1,
                                        createdAt: 1,
                                    },
                                },
                            ],
                            totalCount: [
                                { $count: 'count' }, // Count total documents matching the query
                            ],
                        },
                    },
                ];
                // Execute the aggregation pipeline
                const result = (_a = yield this.customerRepository.getAggregateData(pipeline)) !== null && _a !== void 0 ? _a : [];
                // Extract customers and totalCount from the result
                const customers = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.customers) || [];
                const totalCount = ((_d = (_c = result[0]) === null || _c === void 0 ? void 0 : _c.totalCount[0]) === null || _d === void 0 ? void 0 : _d.count) || 0; // Ensure default value in case it's missing
                const totalPages = Math.ceil(totalCount / limit);
                console.log(customers);
                return { customers, totalCount, totalPages };
            }
            catch (error) {
                console.error('Error fetching paginated customers:', error);
                throw error;
            }
        });
    }
    blockUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.block(id);
        });
    }
    unblockUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.unblock(id);
        });
    }
    extractUserData(user) {
        const extracted = Object.assign({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, favorites: [], bookings: [] }, ((user === null || user === void 0 ? void 0 : user.mobile) && { mobile: user.mobile }));
        return extracted;
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
