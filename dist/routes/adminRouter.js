"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateForm_1 = require("../middlewares/validateForm");
const adminAuth_controller_1 = require("../controllers/admin/adminAuth.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const pages_controller_1 = require("../controllers/admin/pages.controller");
const router = express_1.default.Router();
router.post('/login', validateForm_1.validateLogin, adminAuth_controller_1.loginAdmin);
router.post('/signup', validateForm_1.validateAdmin, adminAuth_controller_1.signupAdmin);
router.get('/dashboard', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAdminDashBoard);
router.get('/customers', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllCustomers);
router.get('/vendors', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllVendors);
router.get('/venues', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllVenues);
router.get('/venues/details/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getVenueDetail);
router.get('/venues/:slug/:status', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.venueStatusApproval);
router.get('/event-planners', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllPlanners);
router.get('/event-planners/details/:slug', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getEventPlannerDetail);
router.get('/event-planners/:slug/:status', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.plannerStatusApproval);
router.get('/venues/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllVenuesBookings);
router.get('/event-planners/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, pages_controller_1.getAllPlannersBookings);
router.get('/logout', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, adminAuth_controller_1.logoutAdmin);
router.get('/customers/block/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, adminAuth_controller_1.blockCutomer);
router.get('/customers/unblock/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, adminAuth_controller_1.unblockCustomer);
router.get('/vendors/block/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, adminAuth_controller_1.blockVendor);
router.get('/vendors/unblock/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, adminAuth_controller_1.unblockVendor);
exports.default = router;
