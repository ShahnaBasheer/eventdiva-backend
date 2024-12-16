import express, { Router } from 'express';
import venueController from '../controllers/vendors/venue-vendor.controller';
import commonController from '../controllers/common.controller';
import { upload } from '../middlewares/multer';
import { ValidateVenue } from '../middlewares/validateForm';

const router: Router = express.Router();



router.get('/dashboard', venueController.getVenueVendorDashboard);
router.get('/service', commonController.getVenue);
router.post('/venue-register', upload, ValidateVenue, venueController.registerVenueVendorService);
router.get('/bookings', venueController.getAllVenueBookings);
router.get('/bookings/details/:bookingId', venueController.getVenueBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', venueController.changeBookingStatus);
router.patch('/bookings/advance-payment/', venueController.generateAdvancePayment);
router.patch('/bookings/full-payment/', venueController.generateFullPayment);
router.get('/calendar', venueController.getAvailabilityInfo);
router.patch('/calendar/add-holiday/', venueController.addHoliday);
// router.patch('/calendar/add-new-event/', controller.addNewEvent);



export default router