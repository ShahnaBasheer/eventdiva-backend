"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const event_planner_controller_1 = require("../controllers/vendors/event-planner.controller");
const multer_1 = require("../middlewares/multer");
const validateForm_1 = require("../middlewares/validateForm");
const router = express_1.default.Router();
router.get('/dashboard', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.getEventPlannerDashboard);
router.get('/profile', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.getEventPlannerProfile);
router.get('/service', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.getEventPlannerService);
router.post('/planner-register', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, multer_1.upload, validateForm_1.ValidateEventPlanner, event_planner_controller_1.registerEventPlannerService);
router.get('/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.getAllPlannerBookings);
router.get('/bookings/details/:bookingId', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.getPlannerBookingDetails);
router.patch('/bookings/details/:bookingId/change-status/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.changeBookingStatus);
router.patch('/bookings/advance-payment/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.generateAdvancePayment);
router.get('/calendar', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.getAvailabilityInfo);
router.patch('/calendar/add-holiday/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.addHoliday);
router.patch('/calendar/add-new-event/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, event_planner_controller_1.addNewEvent);
exports.default = router;
