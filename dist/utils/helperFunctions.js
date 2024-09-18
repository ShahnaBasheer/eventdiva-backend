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
exports.isVendorDocument = exports.handleNotification = exports.generateOrderId = exports.verifyToken = exports.generateNewToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customer_service_1 = __importDefault(require("../services/customer.service"));
const admin_service_1 = __importDefault(require("../services/admin.service"));
const vendor_service_1 = __importDefault(require("../services/vendor.service"));
const jwToken_1 = require("../config/jwToken");
const notification_service_1 = __importDefault(require("../services/notification.service"));
const eventsVariables_1 = require("./eventsVariables");
const important_variables_1 = require("./important-variables");
const verifyToken = (token, role, tokenType) => __awaiter(void 0, void 0, void 0, function* () {
    let secretKey;
    let service;
    switch (role) {
        case important_variables_1.UserRole.Customer:
            secretKey = (tokenType === 1) ? process.env.JWT_CUSTOMER_SECRET : process.env.JWT_REFRESH_CUSTOMER_SECRET;
            service = new customer_service_1.default();
            ;
            break;
        case important_variables_1.UserRole.Admin:
            secretKey = (tokenType === 1) ? process.env.JWT_ADMIN_SECRET : process.env.JWT_REFRESH_ADMIN_SECRET;
            service = new admin_service_1.default();
            break;
        case important_variables_1.UserRole.Vendor:
            secretKey = (tokenType === 1) ? process.env.JWT_VENDOR_SECRET : process.env.JWT_REFRESH_VENDOR_SECRET;
            ;
            service = new vendor_service_1.default();
    }
    if (!secretKey) {
        throw new Error(`JWT secret is not defined for role: ${role}`);
    }
    const decoded = jsonwebtoken_1.default.verify(token, secretKey);
    if (!decoded.id) {
        throw new Error(`Invalid token: no ID found`);
    }
    return yield service.getUserById(decoded === null || decoded === void 0 ? void 0 : decoded.id);
});
exports.verifyToken = verifyToken;
const isVendorDocument = (user) => {
    return user && typeof user.vendorType === 'string';
};
exports.isVendorDocument = isVendorDocument;
const generateNewToken = (id, role) => {
    let newToken = '';
    if (role === important_variables_1.UserRole.Admin) {
        newToken = (0, jwToken_1.generateAdminToken)(id, role);
    }
    else if (role === important_variables_1.UserRole.Customer) {
        newToken = (0, jwToken_1.generateCustomerToken)(id, role);
    }
    else if (role === important_variables_1.UserRole.Vendor) {
        newToken = (0, jwToken_1.generateVendorToken)(id, role);
    }
    return newToken;
};
exports.generateNewToken = generateNewToken;
const generateOrderId = (vendor) => {
    const prefix = 'BK' + vendor; // Order ID prefix
    const uniqueNumber = Math.floor(Math.random() * 10000); // Generate a random number
    const timestamp = Date.now(); // Get current timestamp
    const orderId = `${prefix}-${uniqueNumber}-${timestamp}`; // Combine prefix, random number, and timestamp
    return orderId;
};
exports.generateOrderId = generateOrderId;
const notificationTypes = {
    new_message: (name, message) => ({
        message: `New message from <b>${name}</b>: ${message.slice(0, 14)}..`,
        link: `/messages`
    }),
    booking_created: (bookingId) => ({
        message: `Your booking #${bookingId} has been successfully created.`,
        link: `/bookings/${bookingId}`
    }),
    booking_confirmation: (bookingId) => ({
        message: `Booking #${bookingId} has been confirmed.`,
        link: `/bookings/${bookingId}`
    }),
    booking_cancellation: (bookingId) => ({
        message: `Booking #${bookingId} has been cancelled.`,
        link: `/bookings/${bookingId}/cancellation`
    }),
    advance_payment_customer: (amount, name) => ({
        message: `Generated Advance payment of $${amount} by ${name}.`,
        link: `/payments/advance`
    }),
    advance_payment_vendor: (amount) => ({
        message: `Generated Advance payment for BookingId ${amount}.`,
        link: `/payments/advance`
    }),
    full_payment: (summary) => ({
        message: `Generated Full Payment summary: ${summary}`,
        link: `/payments/full`
    }),
    missed_call: (name) => ({
        message: `You got a missed call from <b>${name}</b>.`,
        link: `/calls/missed`
    }),
    rejected_call: (name) => ({
        message: `${name} has rejected your call. Try again later!`,
        link: `/calls/rejected`
    }),
    signup: () => ({
        message: `Welcome! Your signup is successful.`,
    })
};
const handleNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let notificationData;
    const notificationService = new notification_service_1.default();
    switch (data.type) {
        case eventsVariables_1.NotificationType.MESSAGE:
            notificationData = notificationTypes.new_message(data.name, data.message);
            break;
        case eventsVariables_1.NotificationType.BOOKING_PLACED:
            notificationData = notificationTypes.booking_created(data.bookingId);
            break;
        case eventsVariables_1.NotificationType.MISSED_CALL:
            notificationData = notificationTypes.missed_call(data.name);
            break;
        case eventsVariables_1.NotificationType.BOOKING_CONFIRMATION:
            notificationData = notificationTypes.booking_confirmation(data.bookingId);
            break;
        case eventsVariables_1.NotificationType.BOOKING_CANCELLATION:
            notificationData = notificationTypes.booking_cancellation(data.bookingId);
            break;
        case eventsVariables_1.NotificationType.ADVANCE_PAYMENT:
            notificationData = notificationTypes.advance_payment_customer(data.amount, data.name);
            break;
        case eventsVariables_1.NotificationType.FULL_PAYMENT:
            notificationData = notificationTypes.full_payment(data.summary);
            break;
        case eventsVariables_1.NotificationType.SIGNUP:
            notificationData = notificationTypes.signup();
            break;
        default:
            console.log('Unknown notification type:', data.type);
            return;
    }
    const notification = yield notificationService.addNotification({
        userId: data.userId,
        message: notificationData.message,
        link: notificationData.link,
        userType: data.role,
        notificationType: data.type
    });
    return notification;
});
exports.handleNotification = handleNotification;
