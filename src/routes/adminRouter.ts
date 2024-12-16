
import express, { Router } from 'express';
import { validateAdmin, validateLogin } from '../middlewares/validateForm';
import adminController from '../controllers/admin.controller';
import { authMiddleware, requireRole, setRole } from '../middlewares/authMiddleware';
import { UserRole } from '../utils/important-variables';
import authController from '../controllers/auth.controller';
import commonController from '../controllers/common.controller';


const router: Router = express.Router();


router.post('/login', validateLogin, setRole(UserRole.Admin), authController.login);
router.post('/signup', validateAdmin,setRole(UserRole.Admin), authController.signup);


router.use(authMiddleware, requireRole(UserRole.Admin));

router.get('/dashboard', adminController.getAdminDashBoard);
router.get('/customers', adminController.getAllCustomers);
router.get('/vendors', adminController.getAllVendors);
router.get('/venues', adminController.getAllVenues);
router.get('/venues/details/:slug', commonController.getVenue);
router.get('/venues/:slug/:status', adminController.venueStatusApproval);
router.get('/event-planners', adminController.getAllPlanners);
router.get('/event-planners/details/:slug', commonController.getEventPlanner);
router.get('/event-planners/:slug/:status', adminController.plannerStatusApproval);
router.get('/venues/bookings', adminController.getAllVenuesBookings);
router.get('/event-planners/bookings', adminController.getAllPlannersBookings);
router.get('/customers/block/:id/:role', adminController.blockUser);
router.get('/customers/unblock/:id/:role', adminController.unblockUser);
router.get('/vendors/block/:id/:role', adminController.blockUser);
router.get('/vendors/unblock/:id/:role', adminController.unblockUser);
router.get('/logout', authController.logout);

export default router

