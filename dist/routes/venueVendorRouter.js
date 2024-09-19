"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const venue_vendor_controller_1 = require("../controllers/vendors/venue-vendor.controller");
const multer_1 = require("../middlewares/multer");
const validateForm_1 = require("../middlewares/validateForm");
const router = express_1.default.Router();
router.get('/dashboard', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.getVenueVendorDashboard);
router.get('/profile', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.getVenueVendorProfile);
router.get('/service', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.getVenueVendorService);
router.post('/venue-register', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, multer_1.upload, validateForm_1.ValidateVenue, venue_vendor_controller_1.registerVenueVendorService);
router.get('/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.getAllVenueBookings);
router.get('/bookings/details/:bookingId', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.getVenueBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.changeBookingStatus);
router.patch('/bookings/advance-payment/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.generateAdvancePayment);
router.get('/calendar', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.getAvailabilityInfo);
router.patch('/calendar/add-holiday/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.addHoliday);
router.patch('/calendar/add-new-event/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, venue_vendor_controller_1.addNewEvent);
exports.default = router;