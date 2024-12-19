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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../errors/customError");
const responseFormatter_1 = __importDefault(require("../utils/responseFormatter"));
const dependencyContainer_1 = require("../config/dependencyContainer");
const status_options_1 = require("../utils/status-options");
const helperFunctions_1 = require("../utils/helperFunctions");
class CustomerController {
    constructor(customerService, eventPlannerService, venueVendorService, notificationService) {
        this.customerService = customerService;
        this.eventPlannerService = eventPlannerService;
        this.venueVendorService = venueVendorService;
        this.notificationService = notificationService;
        // Get Customer Profile
        this.getCustomerProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const customerDetail = yield this.customerService.getCustomer((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.user.vendorType);
            (0, responseFormatter_1.default)(200, { customerDetail }, "successful", res, req);
        }));
        // Update Customer Profile
        this.updateCustomerProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { firstName, lastName, mobile } = req.body;
            const data = { firstName, lastName, mobile };
            const customerDetail = yield this.customerService.updateCustomer((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, data);
            req.user = customerDetail;
            (0, responseFormatter_1.default)(200, { customerDetail }, "successful", res, req);
        }));
        // Update Email Profile
        this.updateEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const customerDetail = yield this.customerService.otpSendForUpdateEmail(req.user, email);
            (0, responseFormatter_1.default)(200, null, "OTP has been Sent Successfully!", res, req);
        }));
        // Verify Email Profile
        this.verifyEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const formValue = req.body.formValue;
            const customerDetail = yield this.customerService.otpVerifyForEmail(req.user, formValue);
            req.user = customerDetail;
            (0, responseFormatter_1.default)(200, { customerDetail }, "OTP has been Sent Successfully!", res, req);
        }));
        // Change Password
        this.passwordChangeProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const formValue = req.body.formValue;
            const customerDetail = yield this.customerService.passwordChange(req.user, formValue);
            (0, responseFormatter_1.default)(200, null, "Password has been Changed Successfully!", res, req);
        }));
        this.getCustomerHome = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            (0, responseFormatter_1.default)(200, null, "successfull", res, req);
        }));
        this.getContactPage = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            (0, responseFormatter_1.default)(200, null, "successfully fetch contact page!", res, req);
        }));
        this.getAboutPage = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            (0, responseFormatter_1.default)(200, null, "successfully fetch about page!", res, req);
        }));
        this.getAllEventPlanners = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = "1", limit = "10", services, location, search } = req.query;
            // Convert page and limit to integers
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const parsedServices = (0, helperFunctions_1.parseQueryToStringArray)(services);
            const parsedLocation = location ? String(location) : "";
            const searchItem = search ? String(search) : "";
            // Create filters object
            const filters = {
                services: parsedServices,
                location: parsedLocation || null,
            };
            const eventPlanners = yield this.eventPlannerService.getAllEventPlanners(pageNumber, limitNumber, status_options_1.Status.Approved, filters, searchItem);
            (0, responseFormatter_1.default)(200, Object.assign({}, eventPlanners), "successfully fetch event planners", res, req);
        }));
        this.getAllVenues = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            // Extract query parameters
            let { page = 1, limit = 10, services, amenities, location, venueTypes, search, } = req.query;
            // Convert page and limit to integers
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const searchItem = search ? String(search) : "";
            // Use the utility function to parse query parameters
            const parsedServices = (0, helperFunctions_1.parseQueryToStringArray)(services);
            const parsedAmenities = (0, helperFunctions_1.parseQueryToStringArray)(amenities);
            const parsedVenueTypes = (0, helperFunctions_1.parseQueryToStringArray)(venueTypes);
            const parsedLocation = location ? String(location) : "";
            // Create filters object
            const filters = {
                services: parsedServices,
                amenities: parsedAmenities,
                venueTypes: parsedVenueTypes,
                location: parsedLocation || null,
            };
            // Call the service with filters
            const venues = yield this.venueVendorService.getAllVenues(pageNumber, limitNumber, status_options_1.Status.Approved, filters, searchItem);
            // Send a success response
            (0, responseFormatter_1.default)(200, Object.assign({}, venues), "Successfully fetched venues", res, req);
        }));
        this.getVenueBookingPage = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const venueData = yield this.venueVendorService.getVenue({
                slug,
                approval: status_options_1.Status.Approved,
            });
            (0, responseFormatter_1.default)(200, { venueData }, "successfully fetch venue detail for booking", res, req);
        }));
        this.createVenueBooking = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { slug } = req.params;
            const eventInfo = (_a = req.body) === null || _a === void 0 ? void 0 : _a.eventInfo;
            const addressInfo = (_b = req.body) === null || _b === void 0 ? void 0 : _b.addressInfo;
            const servicesInfo = req.body.servicesInfo;
            const servicesRequested = req.body.servicesRequested;
            let data;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                throw new customError_1.BadRequestError("Validation failed");
            }
            if (eventInfo && addressInfo && servicesInfo) {
                data = yield this.venueVendorService.venueBooking(Object.assign(Object.assign(Object.assign(Object.assign({}, eventInfo), { addressInfo }), servicesInfo), { services: servicesRequested, user: req.user }), slug);
            }
            (0, responseFormatter_1.default)(200, data, "successfully fetch venue detail for booking", res, req);
        }));
        this.venueRazorPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookedData = yield this.venueVendorService.razorPayment(req === null || req === void 0 ? void 0 : req.body);
            (0, responseFormatter_1.default)(200, { bookedData }, "successfull", res, req);
        }));
        this.getAllBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const allBookings = yield this.customerService.getAllBookings((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, { allBookings }, "successfully fetch all bookings", res, req);
        }));
        this.getPlannerBookingForm = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const plannerData = yield this.eventPlannerService.getEventPlanner({
                slug,
                approval: status_options_1.Status.Approved,
            });
            (0, responseFormatter_1.default)(200, { plannerData }, "successfully fetch planner detail for booking", res, req);
        }));
        this.createPlannerBooking = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { slug } = req.params;
            const eventInfo = (_a = req.body) === null || _a === void 0 ? void 0 : _a.eventInfo;
            const addressInfo = (_b = req.body) === null || _b === void 0 ? void 0 : _b.addressInfo;
            const paymentInfo = (_c = req.body) === null || _c === void 0 ? void 0 : _c.paymentInfo;
            let data;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                throw new customError_1.BadRequestError("Validation failed");
            }
            if (eventInfo && addressInfo && paymentInfo) {
                data = yield this.eventPlannerService.plannerBooking(Object.assign(Object.assign(Object.assign(Object.assign({}, eventInfo), { addressInfo }), paymentInfo), { user: req.user }), slug);
            }
            (0, responseFormatter_1.default)(200, data, "successfully fetch planner booking for booking", res, req);
        }));
        this.plannerRazorPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let bookedData = yield this.eventPlannerService.razorPayment(req === null || req === void 0 ? void 0 : req.body);
            (0, responseFormatter_1.default)(200, { bookedData }, "successfull", res, req);
        }));
        this.checkVenueAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const { eventType, isMultipleDays, startDate, endDate, startTime, endTime, } = req.body;
            const isAvailable = yield this.venueVendorService.checkAvailability({ eventType, isMultipleDays, startDate, endDate, startTime, endTime }, slug);
            (0, responseFormatter_1.default)(200, { isAvailable }, "successfull", res, req);
        }));
        this.checkPlannerAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const { eventType, isMultipleDays, startDate, endDate, startTime, endTime, } = req.body;
            const isAvailable = yield this.eventPlannerService.checkAvailability({ eventType, isMultipleDays, startDate, endDate, startTime, endTime }, slug);
            (0, responseFormatter_1.default)(200, { isAvailable }, "successfull", res, req);
        }));
        this.getPlannerBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const { bookingId } = req.params;
            const bookingData = yield this.eventPlannerService.getOneBooking(bookingId);
            let fullPayment = 0;
            // Calculate the total sum of amounts
            if (bookingData) {
                const totalServiceCharges = ((_c = (_b = (_a = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _a === void 0 ? void 0 : _a.fullPayment) === null || _b === void 0 ? void 0 : _b.servicesCharges) === null || _c === void 0 ? void 0 : _c.reduce((sum, charge) => sum + charge.cost, 0)) || 0;
                fullPayment =
                    (((_e = (_d = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _d === void 0 ? void 0 : _d.fullPayment) === null || _e === void 0 ? void 0 : _e.planningFee) || 0) +
                        totalServiceCharges;
            }
            console.log(fullPayment);
            (0, responseFormatter_1.default)(200, { bookingData, fullPayment }, "successfully fetch planner detail for booking", res, req);
        }));
        this.getVenueBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const { bookingId } = req.params;
            const bookingData = yield this.venueVendorService.getOneBooking(bookingId);
            let fullPayment = 0;
            // Calculate the total sum of amounts
            if (bookingData) {
                const totalServiceCharges = ((_c = (_b = (_a = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _a === void 0 ? void 0 : _a.fullPayment) === null || _b === void 0 ? void 0 : _b.servicesCharges) === null || _c === void 0 ? void 0 : _c.reduce((sum, charge) => sum + charge.cost, 0)) || 0;
                fullPayment =
                    (((_e = (_d = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _d === void 0 ? void 0 : _d.fullPayment) === null || _e === void 0 ? void 0 : _e.venueRental) || 0) +
                        totalServiceCharges;
            }
            console.log(fullPayment);
            (0, responseFormatter_1.default)(200, { bookingData, fullPayment }, "successfully fetch planner detail for booking", res, req);
        }));
        this.plannerAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const data = yield this.eventPlannerService.payAdvancepayment(bookingId);
            (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
        }));
        this.plannerFullPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const data = yield this.eventPlannerService.payFullpayment(bookingId);
            (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
        }));
        this.venueAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const data = yield this.venueVendorService.payAdvancepayment(bookingId);
            (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
        }));
        this.venueFullPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const data = yield this.venueVendorService.payFullpayment(bookingId);
            (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
        }));
    }
}
exports.default = new CustomerController(dependencyContainer_1.customerService, dependencyContainer_1.eventPlannerService, dependencyContainer_1.venueVendorService, dependencyContainer_1.notificationService);
;
// const signupCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw new BadRequestError('Validation failed');
//         // res.status(400).json({ errors: errors.array() });
//     }
//     const { email, password, firstName, lastName } = req.body;
//     const response = await userService.signupUser({ email, password, firstName, lastName } , UserRole.Customer);
//     if(response){
//         createSuccessResponse(201, { email },"OTP sent successfully to your email address!", res, req);
//     }
// })
// const verifyOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email, otp } = req.body;
//     const isVerified = await userService.otpVerification(email, otp, UserRole.Customer);
//     if (isVerified) {
//         createSuccessResponse(200, null, "You have successfully signed up! Please Login", res);
//     }
// })
// const resendOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;
//     const result = await userService.resendOtp( email, UserRole.Customer );
//     const remainingLimit = res.getHeader('X-RateLimit-Remaining');;
//     if (result) {
//       createSuccessResponse(201, { email, remainingLimit }, "OTP resent successfully to your email address", res);
//     }
// })
// const loginCustomer = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email, password } = req.body;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw new BadRequestError('Validation failed');
//     }
//     const data = await userService.loginUser(email, password, UserRole.Customer);
//     if(data){
//         res.cookie(process.env.CUSTOMER_REFRESH!, data?.refreshToken, {
//             httpOnly: true,
//             secure: true,
//             maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
//         });
//         createSuccessResponse(200, { token: data.accessToken, user: data.user },'Login successfull', res)
//     }
// });
// const signinWithGoogle = asyncHandler (async(req: Request, res: Response): Promise<void> => {
//     const { idToken } = req.body;
//     const data = await userService.verifyWithGoogle(idToken, UserRole.Customer);
//     if(data){
//         res.cookie(process.env.CUSTOMER_REFRESH!, data?.refreshToken, {
//             httpOnly: true,
//             secure: true,
//             maxAge: 3 * 24 * 60 * 60 * 1000,
//         });
//         createSuccessResponse(200, { token: data?.accessToken, user: data?.customer },'Login successful', res)
//     }
// })
// //logout user
// const logout = asyncHandler(async (req, res) => {
//     const refreshToken = req?.cookies[process.env.CUSTOMER_REFRESH!];
//     if (!refreshToken) {
//         throw new UnauthorizedError("Something Went Wrong!");
//     }
//     // Clear both access token and refresh token cookies
//     res.clearCookie(process.env.CUSTOMER_REFRESH!);
//     createSuccessResponse(200, null, 'Successfully Logout!', res);
// });
// const getCustomerProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const customerDetail = await customerService.getCustomer(req?.user?.id, req.user.vendorType);
//     createSuccessResponse(200, { customerDetail } , "successfull", res, req);
// });
// const updateCustomerProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { firstName, lastName, mobile} = req.body;
//     const data = {firstName, lastName,  mobile };
//     const customerDetail = await customerService.updateCustomer(req?.user?.id, data);
//     req.user = customerDetail;
//     createSuccessResponse(200, { customerDetail } , "successfull", res, req);
// });
// const updateEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { email} = req.body;
//     const customerDetail = await customerService.otpSendForUpdateEmail(req?.user, email);
//     createSuccessResponse(200, null , "OTP has been Sent Successfully!", res, req);
// });
// const verifyEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const formValue = req.body.formValue;
//     const customerDetail = await customerService.otpVerifyForEmail(req?.user, formValue);
//     req.user = customerDetail;
//     createSuccessResponse(200, { customerDetail } , "OTP has been Sent Successfully!", res, req);
// });
// const passWordChangeProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const formValue = req.body.formValue;
//     const customerDetail = await customerService.passwordChange(req?.user, formValue);
//     createSuccessResponse(200, null , "Paasword has been Change Successfully!", res, req);
// });
// export {
//     signupCustomer,
//     verifyOtp,
//     resendOtp,
//     loginCustomer,
//     signinWithGoogle,
//     logout,
//     getCustomerProfile,
//     updateCustomerProfile,
//     updateEmailProfile,
//     verifyEmailProfile,
//     passWordChangeProfile
// };
// Customer Signup
// signupCustomer = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       throw new BadRequestError("Validation failed");
//     }
//     const { email, password, firstName, lastName } = req.body;
//     const response = await this.userService.signupUser(
//       { email, password, firstName, lastName },
//       UserRole.Customer
//     );
//     if (response) {
//       createSuccessResponse(
//         201,
//         { email },
//         "OTP sent successfully to your email address!",
//         res,
//         req
//       );
//     }
//   }
// );
// OTP Verification
//  verifyOtp = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email, otp } = req.body;
//     const isVerified = await this.userService.otpVerification(
//       email,
//       otp,
//       UserRole.Customer
//     );
//     if (isVerified) {
//       createSuccessResponse(
//         200,
//         null,
//         "You have successfully signed up! Please Login",
//         res
//       );
//     }
//   }
// );
// // Resend OTP
// resendOtp = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;
//     const result = await this.userService.resendOtp(email, UserRole.Customer);
//     const remainingLimit = res.getHeader("X-RateLimit-Remaining");
//     if (result) {
//       createSuccessResponse(
//         201,
//         { email, remainingLimit },
//         "OTP resent successfully to your email address",
//         res
//       );
//     }
//   }
// );
