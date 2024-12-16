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
exports.generateServiceFilter = exports.getRefreshKey = exports.capitalize = exports.createToken = exports.parseQueryToStringArray = exports.isVendorDocument = exports.handleNotification = exports.generateOrderId = exports.verifyToken = exports.generateNewToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwToken_1 = require("../config/jwToken");
const eventsVariables_1 = require("./eventsVariables");
const important_variables_1 = require("./important-variables");
const user_service_1 = __importDefault(require("../services/user.service"));
const vendor_repository_1 = __importDefault(require("../repositories/vendor.repository"));
const admin_repository_1 = __importDefault(require("../repositories/admin.repository"));
const customer_repository_1 = __importDefault(require("../repositories/customer.repository"));
const notification_repository_1 = __importDefault(require("../repositories/notification.repository"));
const dependencyContainer_1 = require("../config/dependencyContainer");
const status_options_1 = require("./status-options");
const verifyToken = (token, role, tokenType) => __awaiter(void 0, void 0, void 0, function* () {
    let secretKey;
    switch (role) {
        case important_variables_1.UserRole.Customer:
            secretKey = (tokenType === 1) ? process.env.JWT_CUSTOMER_SECRET : process.env.JWT_REFRESH_CUSTOMER_SECRET;
            break;
        case important_variables_1.UserRole.Admin:
            secretKey = (tokenType === 1) ? process.env.JWT_ADMIN_SECRET : process.env.JWT_REFRESH_ADMIN_SECRET;
            break;
        case important_variables_1.UserRole.Vendor:
            secretKey = (tokenType === 1) ? process.env.JWT_VENDOR_SECRET : process.env.JWT_REFRESH_VENDOR_SECRET;
            ;
    }
    if (!secretKey) {
        throw new Error(`JWT secret is not defined for role: ${role}`);
    }
    const decoded = jsonwebtoken_1.default.verify(token, secretKey);
    if (!decoded.id) {
        throw new Error(`Invalid token: no ID found`);
    }
    const service = new user_service_1.default(new vendor_repository_1.default(), new admin_repository_1.default(), new customer_repository_1.default(), new notification_repository_1.default());
    return yield service.getUserById(decoded === null || decoded === void 0 ? void 0 : decoded.id, role);
});
exports.verifyToken = verifyToken;
const isVendorDocument = (user) => {
    return user && typeof user.vendorType !== undefined;
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
const createToken = (userId, role) => {
    let accessToken, refreshToken;
    if (role === 'admin') {
        accessToken = (0, jwToken_1.generateAdminToken)(userId, role);
        refreshToken = (0, jwToken_1.generateRefreshAdminToken)(userId, role);
    }
    else if (role === 'customer') {
        accessToken = (0, jwToken_1.generateCustomerToken)(userId, role);
        refreshToken = (0, jwToken_1.generateRefreshCustomerToken)(userId, role);
    }
    else if (role === 'vendor') {
        accessToken = (0, jwToken_1.generateVendorToken)(userId, role);
        refreshToken = (0, jwToken_1.generateRefreshVendorToken)(userId, role);
    }
    return { accessToken, refreshToken };
};
exports.createToken = createToken;
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
        message: `Your booking #${bookingId} has been successfully created`,
        link: `/bookings/${bookingId}`
    }),
    booking_confirmation: (bookingId) => ({
        message: `Booking #${bookingId} has been confirmed`,
        link: `/bookings/${bookingId}`
    }),
    booking_cancellation: (bookingId) => ({
        message: `Booking #${bookingId} has been cancelled`,
        link: `/bookings/${bookingId}/cancellation`
    }),
    advance_payment_customer: (amount, name) => ({
        message: `Generated Advance payment of $${amount} by ${name}`,
        link: `/payments/advance`
    }),
    advance_payment_vendor: (amount) => ({
        message: `Generated Advance payment for BookingId ${amount}`,
        link: `/payments/advance`
    }),
    full_payment: (summary) => ({
        message: `Generated Full Payment summary: ${summary}`,
        link: `/payments/full`
    }),
    missed_call: (name) => ({
        message: `You got a missed call from <b>${name}</b>`,
        link: `/calls/missed`
    }),
    rejected_call: (name) => ({
        message: `${name} has rejected your call. Try again later!`,
        link: `/calls/rejected`
    }),
    signup: () => ({
        message: `Welcome! Your signup is successfull`,
    }),
    service_register: () => ({
        message: `Your service has been successfully registered`,
    })
};
const handleNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let notificationData;
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
        case eventsVariables_1.NotificationType.SERVICE_REGISTERED:
            notificationData = notificationTypes.service_register();
            break;
        default:
            console.log('Unknown notification type:', data.type);
            return;
    }
    const notification = yield dependencyContainer_1.notificationService.addNotification({
        userId: data.userId,
        message: notificationData.message,
        link: notificationData.link,
        userType: data.role,
        notificationType: data.type
    });
    return notification;
});
exports.handleNotification = handleNotification;
const parseQueryToStringArray = (param) => {
    if (!param)
        return [];
    if (Array.isArray(param))
        return param.map(String); // Convert each item to string
    return [String(param)];
};
exports.parseQueryToStringArray = parseQueryToStringArray;
const capitalize = (string) => {
    if (!string)
        return ''; // Handle empty or null strings
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const getRefreshKey = (role) => {
    if (role === important_variables_1.UserRole.Admin)
        return process.env.ADMIN_REFRESH;
    else if (role === important_variables_1.UserRole.Customer)
        return process.env.CUSTOMER_REFRESH;
    else if (role === important_variables_1.UserRole.Vendor)
        return process.env.VENDOR_REFRESH;
    return '';
};
exports.getRefreshKey = getRefreshKey;
const generateServiceFilter = (user, slug) => {
    const filter = {};
    switch (user.role) {
        case important_variables_1.UserRole.Vendor:
            filter.vendorId = user.id;
            break;
        case important_variables_1.UserRole.Admin:
            if (!slug)
                throw new Error("Slug is required for admin requests");
            filter.slug = slug;
            break;
        case important_variables_1.UserRole.Customer:
            if (!slug)
                throw new Error("Slug is required for customer requests");
            filter.slug = slug;
            filter.approval = status_options_1.Status.Approved;
            break;
        default:
            throw new Error("Invalid user role");
    }
    return filter;
};
exports.generateServiceFilter = generateServiceFilter;
