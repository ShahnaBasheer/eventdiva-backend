
import express, { Router } from 'express';
import { validateAdmin, validateLogin } from '../middlewares/validateForm';
import { blockCutomer, blockVendor, 
      loginAdmin, logoutAdmin, signupAdmin, 
      unblockCustomer, unblockVendor } from '../controllers/admin/adminAuth.controller';
import { authMiddleware, isUser } from '../middlewares/authMiddleware';
import { getAdminDashBoard, getAllCustomers, 
         getAllPlanners, getAllVendors,
         getAllVenuesBookings, getAllPlannersBookings,
         getVenueDetail, getEventPlannerDetail, 
         venueStatusApproval, getAllVenues,
         plannerStatusApproval 
      } from '../controllers/admin/pages.controller';


const router: Router = express.Router();


router.post('/login', validateLogin, loginAdmin);
router.post('/signup', validateAdmin,  signupAdmin);
router.get('/dashboard', authMiddleware, isUser, getAdminDashBoard);
router.get('/customers', authMiddleware, isUser, getAllCustomers);
router.get('/vendors', authMiddleware, isUser, getAllVendors);
router.get('/venues', authMiddleware, isUser, getAllVenues);
router.get('/venues/:slug/:status', authMiddleware, isUser, venueStatusApproval);
router.get('/venues/details/:slug', authMiddleware, isUser, getVenueDetail);
router.get('/event-planners', authMiddleware, isUser, getAllPlanners);
router.get('/event-planners/:slug/:status', authMiddleware, isUser, plannerStatusApproval);
router.get('/event-planners/details/:slug', authMiddleware, isUser, getEventPlannerDetail);
router.get('/venues/bookings', authMiddleware, isUser, getAllVenuesBookings);
router.get('/event-planners/bookings', authMiddleware, isUser, getAllPlannersBookings);
router.get('/logout', authMiddleware, isUser, logoutAdmin);
router.get('/customers/block/:id', authMiddleware, isUser, blockCutomer);
router.get('/customers/unblock/:id', authMiddleware, isUser, unblockCustomer);
router.get('/vendors/block/:id', authMiddleware, isUser, blockVendor);
router.get('/vendors/unblock/:id', authMiddleware, isUser, unblockVendor);


export default router

