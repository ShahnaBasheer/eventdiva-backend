"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateForm_1 = require("../middlewares/validateForm");
const customer_controller_1 = __importDefault(require("../controllers/customer.controller"));
const rateLimit_1 = __importDefault(require("../middlewares/rateLimit"));
const multer_1 = require("../middlewares/multer");
const socket_controller_1 = __importDefault(require("../controllers/socket.controller"));
const important_variables_1 = require("../utils/important-variables");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const common_controller_1 = __importDefault(require("../controllers/common.controller"));
const router = express_1.default.Router();
router.post('/login', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), validateForm_1.validateLogin, auth_controller_1.default.login);
router.post('/signup', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), validateForm_1.validateSignup, auth_controller_1.default.signup);
router.post('/verify-otp', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), auth_controller_1.default.verifyOtp);
router.post('/resend-otp', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), rateLimit_1.default, auth_controller_1.default.resendOtp);
router.post('/auth/google', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), auth_controller_1.default.signinWithGoogle);
router.use(authMiddleware_1.authMiddleware);
router.get('/', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), customer_controller_1.default.getCustomerHome);
router.get('/home', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), customer_controller_1.default.getCustomerHome);
router.get('/contact', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), customer_controller_1.default.getContactPage);
router.get('/about', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), customer_controller_1.default.getAboutPage);
router.get('/vendors/event-planners', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), customer_controller_1.default.getAllEventPlanners);
router.get('/vendors/event-planners/:slug', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), common_controller_1.default.getEventPlanner);
router.get('/vendors/venues', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), customer_controller_1.default.getAllVenues);
router.get('/vendors/venues/:slug', (0, authMiddleware_1.setRole)(important_variables_1.UserRole.Customer), common_controller_1.default.getVenue);
router.use((0, authMiddleware_1.requireRole)(important_variables_1.UserRole.Customer));
router.get('/vendors/venues/booking/:slug', customer_controller_1.default.getVenueBookingPage);
router.post('/venues/booking/payment/:slug', multer_1.upload, validateForm_1.ValidateVenueBooking, customer_controller_1.default.createVenueBooking);
router.post('/venues/booking/razorpay', customer_controller_1.default.venueRazorPayment);
router.post('/venues/check-availability/:slug', validateForm_1.ValidateCheckAvailability, customer_controller_1.default.checkVenueAvailability);
router.get('/vendors/event-planners/booking/:slug', customer_controller_1.default.getPlannerBookingForm);
router.post('/event-planners/booking/payment/:slug', validateForm_1.ValidatePlannerBooking, customer_controller_1.default.createPlannerBooking);
router.post('/event-planners/booking/razorpay', customer_controller_1.default.plannerRazorPayment);
router.post('/event-planners/check-availability/:slug', validateForm_1.ValidateCheckAvailability, customer_controller_1.default.checkPlannerAvailability);
router.get('/bookings', customer_controller_1.default.getAllBookings);
router.get('/bookings/event-planner/details/:bookingId', customer_controller_1.default.getPlannerBookingDetails);
router.get('/bookings/event-planner/advancepayment/:bookingId', customer_controller_1.default.plannerAdvancePayment);
router.get('/bookings/event-planner/fullpayment/:bookingId', customer_controller_1.default.plannerFullPayment);
router.get('/bookings/venue/details/:bookingId', customer_controller_1.default.getVenueBookingDetails);
router.get('/bookings/venue/advancepayment/:bookingId', customer_controller_1.default.venueAdvancePayment);
router.get('/bookings/venue/fullpayment/:bookingId', customer_controller_1.default.venueFullPayment);
router.post('/video-call/start-call', socket_controller_1.default.getStartCall);
router.post('/chat-room/join-room', socket_controller_1.default.getOrCreateChatRoom);
router.get('/notifications', common_controller_1.default.getNotifications);
router.patch('/notifications/read', common_controller_1.default.notificationReadStatus);
router.delete('/notifications/delete/:id', common_controller_1.default.deleteNotification);
router.patch('/message/read', common_controller_1.default.markMessageRead);
router.get('/profile', customer_controller_1.default.getCustomerProfile);
router.patch('/profile/update', customer_controller_1.default.updateCustomerProfile);
router.patch('/profile/email/', customer_controller_1.default.updateEmailProfile);
router.patch('/profile/email-update', customer_controller_1.default.verifyEmailProfile);
router.patch('/profile/password-change', customer_controller_1.default.passwordChangeProfile);
router.get('/logout', auth_controller_1.default.logout);
exports.default = router;
