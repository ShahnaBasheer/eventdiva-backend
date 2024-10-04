

import express, { Router } from 'express';
import { getAllEventPlanners, getAllVenues, 
        getCustomerHome, getEventPlannerDetail, 
        getVenueDetail, getVenueBookingPage,
        createVenueBooking, getAllBookings, 
        venueRazorPayment, getPlannerBookingForm,
        createPlannerBooking, plannerRazorPayment,
        checkVenueAvailability, checkPlannerAvailability,
        getNotifications, changeReadStatus,
        deleteNotification, getPlannerBookingDetails,
        getVenueBookingDetails, plannerAdvancePayment,
        plannerFullPayment, venueAdvancePayment,
        venueFullPayment, getContactPage,
        getAboutPage } from '../controllers/customers/pages.controller';
import { authMiddleware, isUser } from '../middlewares/authMiddleware';
import { validateSignup, validateLogin, ValidateVenueBooking, ValidatePlannerBooking, ValidateCheckAvailability } from '../middlewares/validateForm';
import { getCustomerProfile, loginCustomer, logout, passWordChangeProfile, resendOtp, signinWithGoogle, signupCustomer, updateCustomerProfile, updateEmailProfile, verifyEmailProfile, verifyOtp } from '../controllers/customers/customer.controller';
import resendOtpLimiter from '../middlewares/rateLimit';
import { upload } from '../middlewares/multer';
import { getOrCreateChatRoom, getStartCall,  } from '../controllers/common/socket.controller';


const router: Router = express.Router();


router.get('/', authMiddleware, getCustomerHome);
router.get('/home', authMiddleware, getCustomerHome);
router.get('/contact', authMiddleware, getContactPage);
router.get('/about', authMiddleware, getAboutPage);
router.get('/vendors/event-planners', authMiddleware, getAllEventPlanners);
router.get('/vendors/event-planners/:slug', authMiddleware, getEventPlannerDetail);
router.get('/vendors/venues', authMiddleware, getAllVenues);
router.get('/vendors/venues/:slug', authMiddleware, getVenueDetail);
router.get('/vendors/venues/booking/:slug', authMiddleware, isUser, getVenueBookingPage);
router.post('/venues/booking/payment/:slug', authMiddleware, isUser, upload, ValidateVenueBooking, createVenueBooking);
router.post('/venues/booking/razorpay', authMiddleware,isUser, venueRazorPayment);
router.post('/venues/check-availability/:slug', authMiddleware, isUser, ValidateCheckAvailability, checkVenueAvailability)
router.get('/vendors/event-planners/booking/:slug', authMiddleware, isUser, getPlannerBookingForm);
router.post('/event-planners/booking/payment/:slug', authMiddleware, isUser, ValidatePlannerBooking, createPlannerBooking);
router.post('/event-planners/booking/razorpay', authMiddleware,isUser, plannerRazorPayment);
router.post('/event-planners/check-availability/:slug', authMiddleware, isUser, ValidateCheckAvailability, checkPlannerAvailability)
router.get('/bookings', authMiddleware, isUser, getAllBookings);
router.get('/bookings/event-planner/details/:bookingId', authMiddleware, isUser, getPlannerBookingDetails);
router.get('/bookings/event-planner/advancepayment/:bookingId', authMiddleware, isUser, plannerAdvancePayment);
router.get('/bookings/event-planner/fullpayment/:bookingId', authMiddleware, isUser, plannerFullPayment);
router.get('/bookings/venue/details/:bookingId', authMiddleware, isUser, getVenueBookingDetails);
router.get('/bookings/venue/advancepayment/:bookingId', authMiddleware, isUser, venueAdvancePayment);
router.get('/bookings/venue/fullpayment/:bookingId', authMiddleware, isUser, venueFullPayment);
router.post('/video-call/start-call', authMiddleware, isUser, getStartCall);
router.post('/chat-room/join-room', authMiddleware, isUser, getOrCreateChatRoom);
router.get('/notifications', authMiddleware, isUser, getNotifications);
router.patch('/notifications/read', authMiddleware, isUser, changeReadStatus);
router.delete('/notifications/delete/:id', authMiddleware, isUser, deleteNotification);
router.get('/profile', authMiddleware, isUser, getCustomerProfile);
router.patch('/profile/update', authMiddleware, isUser, updateCustomerProfile);
router.patch('/profile/email/', authMiddleware, isUser, updateEmailProfile);
router.patch('/profile/email-update', authMiddleware, isUser, verifyEmailProfile);
router.patch('/profile/password-change', authMiddleware, isUser, passWordChangeProfile);
router.post('/login', validateLogin, loginCustomer);
router.post('/signup', validateSignup, signupCustomer);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtpLimiter, resendOtp);
router.post('/auth/google', signinWithGoogle);
router.get('/contact', authMiddleware, getContactPage);
router.get('/logout', authMiddleware, isUser, logout);




export default router

