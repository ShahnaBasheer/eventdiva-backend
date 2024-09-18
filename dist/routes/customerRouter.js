"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pages_controller_1 = require("../controllers/customers/pages.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateForm_1 = require("../middlewares/validateForm");
const customer_controller_1 = require("../controllers/customers/customer.controller");
const rateLimit_1 = __importDefault(require("../middlewares/rateLimit"));
const multer_1 = require("../middlewares/multer");
const socket_controller_1 = require("../controllers/common/socket.controller");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.authMiddleware, pages_controller_1.getCustomerHome);
router.get('/home', authMiddleware_1.authMiddleware, pages_controller_1.getCustomerHome);
router.get('/venues', authMiddleware_1.authMiddleware, pages_controller_1.getCustomerHome);
router.get('/vendors/event-planners', authMiddleware_1.authMiddleware, pages_controller_1.getAllEventPlanners);
router.get('/vendors/event-planners/:slug', authMiddleware_1.authMiddleware, pages_controller_1.getEventPlannerDetail);
router.get('/vendors/venues', authMiddleware_1.authMiddleware, pages_controller_1.getAllVenues);
router.get('/vendors/venues/:slug', authMiddleware_1.authMiddleware, pages_controller_1.getVenueDetail);
router.get('/vendors/venues/booking/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getVenueBookingPage);
router.post('/venues/booking/payment/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, multer_1.upload, validateForm_1.ValidateVenueBooking, pages_controller_1.createVenueBooking);
router.post('/venues/booking/razorpay', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.venueRazorPayment);
router.post('/venues/check-availability/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, validateForm_1.ValidateCheckAvailability, pages_controller_1.checkVenueAvailability);
router.get('/vendors/event-planners/booking/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getPlannerBookingPage);
router.post('/event-planners/booking/payment/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, validateForm_1.ValidatePlannerBooking, pages_controller_1.createPlannerBooking);
router.post('/event-planners/booking/razorpay', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.plannerRazorPayment);
router.post('/event-planners/check-availability/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, validateForm_1.ValidateCheckAvailability, pages_controller_1.checkPlannerAvailability);
router.get('/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllBookings);
router.post('/video-call/start-call', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, socket_controller_1.getStartCall);
router.post('/chat-room/join-room', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, socket_controller_1.getOrCreateChatRoom);
router.get('/notifications', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getNotifications);
router.patch('/notifications/read', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.changeReadStatus);
router.delete('/notifications/delete/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.deleteNotification);
router.post('/login', validateForm_1.validateLogin, customer_controller_1.loginCustomer);
router.post('/signup', validateForm_1.validateSignup, customer_controller_1.signupCustomer);
router.post('/verify-otp', customer_controller_1.verifyOtp);
router.post('/resend-otp', rateLimit_1.default, customer_controller_1.resendOtp);
router.post('/auth/google', customer_controller_1.signinWithGoogle);
router.get('/logout', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, customer_controller_1.logout);
exports.default = router;
