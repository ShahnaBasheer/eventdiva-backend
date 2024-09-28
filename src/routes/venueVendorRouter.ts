import express, { Router } from 'express';
import { authMiddleware, isUser } from '../middlewares/authMiddleware';
import { getVenueVendorDashboard, getVenueVendorProfile, 
       getVenueVendorService, registerVenueVendorService,
       getAllVenueBookings, getVenueBookingDetails, 
       changeBookingStatus, generateAdvancePayment,
       getAvailabilityInfo, addHoliday, addNewEvent,
       generateFullPayment
    } from '../controllers/vendors/venue-vendor.controller';
import { upload } from '../middlewares/multer';
import { ValidateVenue } from '../middlewares/validateForm';


const router: Router = express.Router();


router.get('/dashboard', authMiddleware, isUser, getVenueVendorDashboard);
router.get('/service', authMiddleware, isUser, getVenueVendorService);
router.post('/venue-register', authMiddleware, isUser, upload, ValidateVenue, registerVenueVendorService);
router.get('/bookings', authMiddleware, isUser, getAllVenueBookings);
router.get('/bookings/details/:bookingId', authMiddleware, isUser, getVenueBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', authMiddleware, isUser, changeBookingStatus);
router.patch('/bookings/advance-payment/', authMiddleware, isUser, generateAdvancePayment);
router.patch('/bookings/full-payment/', authMiddleware, isUser, generateFullPayment);
router.get('/calendar', authMiddleware, isUser, getAvailabilityInfo);
router.patch('/calendar/add-holiday/', authMiddleware, isUser, addHoliday);
router.patch('/calendar/add-new-event/', authMiddleware, isUser, addNewEvent);

export default router