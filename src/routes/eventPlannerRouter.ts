
import express, { Router } from 'express';
import { authMiddleware, isUser } from '../middlewares/authMiddleware';
import { getEventPlannerDashboard, 
    getEventPlannerService, registerEventPlannerService,
    getAllPlannerBookings, getPlannerBookingDetails,
    changeBookingStatus, generateAdvancePayment , getAvailabilityInfo,
    addHoliday, addNewEvent, generateFullPayment
} from '../controllers/vendors/event-planner.controller';

import { upload } from '../middlewares/multer';
import { ValidateEventPlanner } from '../middlewares/validateForm';



const router: Router = express.Router();


router.get('/dashboard', authMiddleware, isUser, getEventPlannerDashboard);
router.get('/service', authMiddleware, isUser, getEventPlannerService);
router.post('/planner-register', authMiddleware, isUser, upload, ValidateEventPlanner, registerEventPlannerService);
router.get('/bookings', authMiddleware, isUser, getAllPlannerBookings);
router.get('/bookings/details/:bookingId', authMiddleware, isUser, getPlannerBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', authMiddleware, isUser, changeBookingStatus);
router.patch('/bookings/advance-payment/', authMiddleware, isUser, generateAdvancePayment);
router.patch('/bookings/full-payment/', authMiddleware, isUser, generateFullPayment);
router.get('/calendar', authMiddleware, isUser, getAvailabilityInfo);
router.patch('/calendar/add-holiday/', authMiddleware, isUser, addHoliday);
router.patch('/calendar/add-new-event/', authMiddleware, isUser, addNewEvent);


export default router

