
import express, { Router } from 'express';
import plannerController from '../controllers/vendors/event-planner.controller';
import { upload } from '../middlewares/multer';
import { ValidateEventPlanner } from '../middlewares/validateForm';
import commonController from '../controllers/common.controller';


const router: Router = express.Router();



router.get('/dashboard', plannerController.getEventPlannerDashboard);
router.get('/service', commonController.getEventPlanner);
router.post('/planner-register', upload, ValidateEventPlanner, plannerController.registerEventPlannerService);
router.get('/bookings', plannerController.getAllPlannerBookings);
router.get('/bookings/details/:bookingId', plannerController.getPlannerBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', plannerController.changeBookingStatus);
router.patch('/bookings/advance-payment/', plannerController.generateAdvancePayment);
router.patch('/bookings/full-payment/', plannerController.generateFullPayment);
router.get('/calendar', plannerController.getAvailabilityInfo);
router.patch('/calendar/add-holiday/', plannerController.addHoliday);
// router.patch('/calendar/add-new-event/', authMiddleware, addNewEvent);


export default router

