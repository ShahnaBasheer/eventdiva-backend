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
    getCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.getAllWithPopuate({});
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
}
exports.default = CustomerService;
