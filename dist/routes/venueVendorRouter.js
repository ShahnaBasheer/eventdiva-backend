"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const venue_vendor_controller_1 = __importDefault(require("../controllers/vendors/venue-vendor.controller"));
const common_controller_1 = __importDefault(require("../controllers/common.controller"));
const multer_1 = require("../middlewares/multer");
const validateForm_1 = require("../middlewares/validateForm");
const router = express_1.default.Router();
router.get('/dashboard', venue_vendor_controller_1.default.getVenueVendorDashboard);
router.get('/service', common_controller_1.default.getVenue);
router.post('/venue-register', multer_1.upload, validateForm_1.ValidateVenue, venue_vendor_controller_1.default.registerVenueVendorService);
router.get('/bookings', venue_vendor_controller_1.default.getAllVenueBookings);
router.get('/bookings/details/:bookingId', venue_vendor_controller_1.default.getVenueBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', venue_vendor_controller_1.default.changeBookingStatus);
router.patch('/bookings/advance-payment/', venue_vendor_controller_1.default.generateAdvancePayment);
router.patch('/bookings/full-payment/', venue_vendor_controller_1.default.generateFullPayment);
router.get('/calendar', venue_vendor_controller_1.default.getAvailabilityInfo);
router.patch('/calendar/add-holiday/', venue_vendor_controller_1.default.addHoliday);
// router.patch('/calendar/add-new-event/', controller.addNewEvent);
exports.default = router;
