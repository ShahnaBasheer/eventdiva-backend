

import express, { Router } from 'express';
import { authMiddleware, requireRole, setRole } from '../middlewares/authMiddleware';
import { validateSignup, validateLogin, ValidateVenueBooking, ValidatePlannerBooking, ValidateCheckAvailability } from '../middlewares/validateForm';
import customerController from '../controllers/customer.controller';
import resendOtpLimiter from '../middlewares/rateLimit';
import { upload } from '../middlewares/multer';
import socketController from '../controllers/socket.controller';
import { UserRole } from '../utils/important-variables';
import authController from '../controllers/auth.controller';
import commonController from '../controllers/common.controller';

const router: Router = express.Router();



router.post('/login', setRole(UserRole.Customer), validateLogin, authController.login);
router.post('/signup', setRole(UserRole.Customer), validateSignup, authController.signup);
router.post('/verify-otp', setRole(UserRole.Customer), authController.verifyOtp);
router.post('/resend-otp', setRole(UserRole.Customer), resendOtpLimiter, authController.resendOtp);
router.post('/auth/google', setRole(UserRole.Customer), authController.signinWithGoogle);



router.use(authMiddleware);
router.get('/', setRole(UserRole.Customer), customerController.getCustomerHome);
router.get('/home', setRole(UserRole.Customer), customerController.getCustomerHome);
router.get('/contact', setRole(UserRole.Customer), customerController.getContactPage);
router.get('/about', setRole(UserRole.Customer), customerController.getAboutPage);
router.get('/vendors/event-planners', setRole(UserRole.Customer), customerController.getAllEventPlanners);
router.get('/vendors/event-planners/:slug', setRole(UserRole.Customer), commonController.getEventPlanner);
router.get('/vendors/venues', setRole(UserRole.Customer), customerController.getAllVenues);
router.get('/vendors/venues/:slug', setRole(UserRole.Customer), commonController.getVenue);


router.use(requireRole(UserRole.Customer));


router.get('/vendors/venues/booking/:slug', customerController.getVenueBookingPage);
router.post('/venues/booking/payment/:slug', upload, ValidateVenueBooking, customerController.createVenueBooking);
router.post('/venues/booking/razorpay', customerController.venueRazorPayment);
router.post('/venues/check-availability/:slug', ValidateCheckAvailability, customerController.checkVenueAvailability)
router.get('/vendors/event-planners/booking/:slug', customerController.getPlannerBookingForm);
router.post('/event-planners/booking/payment/:slug', ValidatePlannerBooking, customerController.createPlannerBooking);
router.post('/event-planners/booking/razorpay', customerController.plannerRazorPayment);
router.post('/event-planners/check-availability/:slug', ValidateCheckAvailability, customerController.checkPlannerAvailability)
router.get('/bookings', customerController.getAllBookings);
router.get('/bookings/event-planner/details/:bookingId', customerController.getPlannerBookingDetails);
router.get('/bookings/event-planner/advancepayment/:bookingId', customerController.plannerAdvancePayment);
router.get('/bookings/event-planner/fullpayment/:bookingId', customerController.plannerFullPayment);
router.get('/bookings/venue/details/:bookingId', customerController.getVenueBookingDetails);
router.get('/bookings/venue/advancepayment/:bookingId', customerController.venueAdvancePayment);
router.get('/bookings/venue/fullpayment/:bookingId', customerController.venueFullPayment);
router.post('/video-call/start-call', socketController.getStartCall);
router.post('/chat-room/join-room', socketController.getOrCreateChatRoom);
router.get('/notifications', commonController.getNotifications);
router.patch('/notifications/read', commonController.notificationReadStatus);
router.delete('/notifications/delete/:id', commonController.deleteNotification);
router.patch('/message/read', commonController.markMessageRead);
router.get('/profile', customerController.getCustomerProfile);
router.patch('/profile/update', customerController.updateCustomerProfile);
router.patch('/profile/email/', customerController.updateEmailProfile);
router.patch('/profile/email-update', customerController.verifyEmailProfile);
router.patch('/profile/password-change', customerController.passwordChangeProfile);
router.get('/logout', authController.logout);




export default router

