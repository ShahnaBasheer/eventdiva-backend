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
exports.getAboutPage = exports.getContactPage = exports.venueFullPayment = exports.venueAdvancePayment = exports.plannerFullPayment = exports.plannerAdvancePayment = exports.getVenueBookingDetails = exports.getPlannerBookingDetails = exports.deleteNotification = exports.changeReadStatus = exports.getNotifications = exports.checkPlannerAvailability = exports.checkVenueAvailability = exports.plannerRazorPayment = exports.createPlannerBooking = exports.getPlannerBookingForm = exports.getAllBookings = exports.venueRazorPayment = exports.createVenueBooking = exports.getVenueBookingPage = exports.getVenueDetail = exports.getAllVenues = exports.getEventPlannerDetail = exports.getAllEventPlanners = exports.getAllVendors = exports.getCustomerHome = void 0;
const customer_service_1 = __importDefault(require("../../services/customer.service"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const eventPlanner_service_1 = __importDefault(require("../../services/eventPlanner.service"));
const venueVendor_service_1 = __importDefault(require("../../services/venueVendor.service"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const status_options_1 = require("../../utils/status-options");
const notification_service_1 = __importDefault(require("../../services/notification.service"));
const customerService = new customer_service_1.default();
const eventPlannerService = new eventPlanner_service_1.default();
const venueVendorService = new venueVendor_service_1.default();
const notificationService = new notification_service_1.default();
const getCustomerHome = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, responseFormatter_1.default)(200, null, "successfull", res, req);
}));
exports.getCustomerHome = getCustomerHome;
const getAllVendors = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, responseFormatter_1.default)(200, null, "successfully", res, req);
}));
exports.getAllVendors = getAllVendors;
const getContactPage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, responseFormatter_1.default)(200, null, "successfully fetch contact page!", res, req);
}));
exports.getContactPage = getContactPage;
const getAboutPage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, responseFormatter_1.default)(200, null, "successfully fetch about page!", res, req);
}));
exports.getAboutPage = getAboutPage;
const getAllEventPlanners = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventPlanners = yield eventPlannerService.getAllEventPlanners({ approval: status_options_1.Status.Approved });
    (0, responseFormatter_1.default)(200, { eventPlanners }, "successfully fetch event planners", res, req);
}));
exports.getAllEventPlanners = getAllEventPlanners;
const getEventPlannerDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const eventPlannerData = yield eventPlannerService.getEventPlanner({ slug, approval: status_options_1.Status.Approved });
    (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfully fetch event planner detail", res, req);
}));
exports.getEventPlannerDetail = getEventPlannerDetail;
const getAllVenues = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract query parameters
    let { page = 1, limit = 10, status, services, amenities, location } = req.query;
    // Parse page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    // Ensure status is a string if provided
    status = status === null || status === void 0 ? void 0 : status.toString();
    // Parse services and amenities as arrays (if they are comma-separated strings)
    const parsedServices = services ? services.split(',') : [];
    const parsedAmenities = amenities ? amenities.split(',') : [];
    // Ensure location remains a string
    const parsedLocation = location ? location.toString() : '';
    // Create filters object
    const filters = {
        services: parsedServices.length > 0 ? parsedServices : [],
        amenities: parsedAmenities.length > 0 ? parsedAmenities : [],
        location: parsedLocation || null,
    };
    // Call the service with filters
    const venues = yield venueVendorService.getAllVenues(page, limit, status_options_1.Status.Approved, filters);
    // Send a success response
    (0, responseFormatter_1.default)(200, Object.assign({}, venues), "Successfully fetched venues", res, req);
}));
exports.getAllVenues = getAllVenues;
const getVenueDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const venueData = yield venueVendorService.getVenue({ slug, approval: status_options_1.Status.Approved });
    (0, responseFormatter_1.default)(200, { venueData }, "successfully fetch venue detail", res, req);
}));
exports.getVenueDetail = getVenueDetail;
const getVenueBookingPage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const venueData = yield venueVendorService.getVenue({ slug, approval: status_options_1.Status.Approved });
    (0, responseFormatter_1.default)(200, { venueData }, "successfully fetch venue detail for booking", res, req);
}));
exports.getVenueBookingPage = getVenueBookingPage;
const createVenueBooking = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        throw new customError_1.BadRequestError('Validation failed');
    }
    if (eventInfo && addressInfo && servicesInfo) {
        data = yield venueVendorService.venueBooking(Object.assign(Object.assign(Object.assign(Object.assign({}, eventInfo), { addressInfo }), servicesInfo), { services: servicesRequested, user: req.user }), slug);
    }
    (0, responseFormatter_1.default)(200, data, "successfully fetch venue detail for booking", res, req);
}));
exports.createVenueBooking = createVenueBooking;
const venueRazorPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let bookedData = yield venueVendorService.razorPayment(req === null || req === void 0 ? void 0 : req.body);
    (0, responseFormatter_1.default)(200, { bookedData }, "successfull", res, req);
}));
exports.venueRazorPayment = venueRazorPayment;
const getAllBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const allBookings = yield customerService.getAllBookings((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
    (0, responseFormatter_1.default)(200, { allBookings }, "successfully fetch all bookings", res, req);
}));
exports.getAllBookings = getAllBookings;
const getPlannerBookingForm = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const plannerData = yield eventPlannerService.getEventPlanner({ slug, approval: status_options_1.Status.Approved });
    (0, responseFormatter_1.default)(200, { plannerData }, "successfully fetch planner detail for booking", res, req);
}));
exports.getPlannerBookingForm = getPlannerBookingForm;
const createPlannerBooking = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    const { slug } = req.params;
    const eventInfo = (_d = req.body) === null || _d === void 0 ? void 0 : _d.eventInfo;
    const addressInfo = (_e = req.body) === null || _e === void 0 ? void 0 : _e.addressInfo;
    const paymentInfo = (_f = req.body) === null || _f === void 0 ? void 0 : _f.paymentInfo;
    let data;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new customError_1.BadRequestError('Validation failed');
    }
    if (eventInfo && addressInfo && paymentInfo) {
        data = yield eventPlannerService.plannerBooking(Object.assign(Object.assign(Object.assign(Object.assign({}, eventInfo), { addressInfo }), paymentInfo), { user: req.user }), slug);
    }
    (0, responseFormatter_1.default)(200, data, "successfully fetch planner booking for booking", res, req);
}));
exports.createPlannerBooking = createPlannerBooking;
const plannerRazorPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let bookedData = yield eventPlannerService.razorPayment(req === null || req === void 0 ? void 0 : req.body);
    (0, responseFormatter_1.default)(200, { bookedData }, "successfull", res, req);
}));
exports.plannerRazorPayment = plannerRazorPayment;
const checkVenueAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const { eventType, isMultipleDays, startDate, endDate, startTime, endTime } = req.body;
    const isAvailable = yield venueVendorService.checkAvailability({ eventType, isMultipleDays, startDate, endDate, startTime, endTime }, slug);
    (0, responseFormatter_1.default)(200, { isAvailable }, "successfull", res, req);
}));
exports.checkVenueAvailability = checkVenueAvailability;
const checkPlannerAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const { eventType, isMultipleDays, startDate, endDate, startTime, endTime } = req.body;
    const isAvailable = yield eventPlannerService.checkAvailability({ eventType, isMultipleDays, startDate, endDate, startTime, endTime }, slug);
    (0, responseFormatter_1.default)(200, { isAvailable }, "successfull", res, req);
}));
exports.checkPlannerAvailability = checkPlannerAvailability;
const getNotifications = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    const data = yield notificationService.getNotifications((_g = req.user) === null || _g === void 0 ? void 0 : _g.id, (_h = req.user) === null || _h === void 0 ? void 0 : _h.role);
    (0, responseFormatter_1.default)(200, { notifications: data.notifications, readCount: data.readCount }, "successfull", res, req);
}));
exports.getNotifications = getNotifications;
const changeReadStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notificationService.updateReadStatus(req.body.id);
    (0, responseFormatter_1.default)(200, { notification }, "successfull", res, req);
}));
exports.changeReadStatus = changeReadStatus;
const deleteNotification = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params, "njjjcxnd");
    const notification = yield notificationService.deleteNotification(req.params.id);
    (0, responseFormatter_1.default)(200, { notification }, "successfull", res, req);
}));
exports.deleteNotification = deleteNotification;
const getPlannerBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l, _m, _o;
    const { bookingId } = req.params;
    const bookingData = yield eventPlannerService.getOneBooking(bookingId);
    let fullPayment = 0;
    // Calculate the total sum of amounts
    if (bookingData) {
        const totalServiceCharges = ((_l = (_k = (_j = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _j === void 0 ? void 0 : _j.fullPayment) === null || _k === void 0 ? void 0 : _k.servicesCharges) === null || _l === void 0 ? void 0 : _l.reduce((sum, charge) => sum + charge.cost, 0)) || 0;
        fullPayment = (((_o = (_m = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _m === void 0 ? void 0 : _m.fullPayment) === null || _o === void 0 ? void 0 : _o.planningFee) || 0) + totalServiceCharges;
    }
    console.log(fullPayment);
    (0, responseFormatter_1.default)(200, { bookingData, fullPayment }, "successfully fetch planner detail for booking", res, req);
}));
exports.getPlannerBookingDetails = getPlannerBookingDetails;
const getVenueBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q, _r, _s, _t;
    const { bookingId } = req.params;
    const bookingData = yield venueVendorService.getOneBooking(bookingId);
    let fullPayment = 0;
    // Calculate the total sum of amounts
    if (bookingData) {
        const totalServiceCharges = ((_r = (_q = (_p = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _p === void 0 ? void 0 : _p.fullPayment) === null || _q === void 0 ? void 0 : _q.servicesCharges) === null || _r === void 0 ? void 0 : _r.reduce((sum, charge) => sum + charge.cost, 0)) || 0;
        fullPayment = (((_t = (_s = bookingData === null || bookingData === void 0 ? void 0 : bookingData.charges) === null || _s === void 0 ? void 0 : _s.fullPayment) === null || _t === void 0 ? void 0 : _t.venueRental) || 0) + totalServiceCharges;
    }
    console.log(fullPayment);
    (0, responseFormatter_1.default)(200, { bookingData, fullPayment }, "successfully fetch planner detail for booking", res, req);
}));
exports.getVenueBookingDetails = getVenueBookingDetails;
const plannerAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const data = yield eventPlannerService.payAdvancepayment(bookingId);
    console.log(data, "jjhkjkj");
    (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
}));
exports.plannerAdvancePayment = plannerAdvancePayment;
const plannerFullPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const data = yield eventPlannerService.payFullpayment(bookingId);
    console.log(data, "jjhkjkj");
    (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
}));
exports.plannerFullPayment = plannerFullPayment;
const venueAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const data = yield venueVendorService.payAdvancepayment(bookingId);
    console.log(data, "jjhkjkj");
    (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
}));
exports.venueAdvancePayment = venueAdvancePayment;
const venueFullPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const data = yield venueVendorService.payFullpayment(bookingId);
    console.log(data, "jjhkjkj");
    (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfully fetch planner booking for booking", res, req);
}));
exports.venueFullPayment = venueFullPayment;
// import { Request, Response } from 'express';
// import { UserService } from '../services/user.service';
// export class UserController {
//   private userService = new UserService();
//   async getAllUsers(req: Request, res: Response): Promise<void> {
//     const users = await this.userService.getAllUsers();
//     res.json(users);
//   }
//   async getUserById(req: Request, res: Response): Promise<void> {
//     const id = parseInt(req.params.id, 10);
//     const user = await this.userService.getUserById(id);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).send('User not found');
//     }
//   }
//   async createUser(req: Request, res: Response): Promise<void> {
//     const user = await this.userService.createUser(req.body);
//     res.status(201).json(user);
//   }
//   async updateUser(req: Request, res: Response): Promise<void> {
//     const id = parseInt(req.params.id, 10);
//     const user = await this.userService.updateUser(id, req.body);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).send('User not found');
//     }
//   }
//   async deleteUser(req: Request, res: Response): Promise<void> {
//     const id = parseInt(req.params.id, 10);
//     const success = await this.userService.deleteUser(id);
//     if (success) {
//       res.status(204).send();
//     } else {
//       res.status(404).send('User not found');
//     }
//   }
// }
