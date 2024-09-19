"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewEvent = exports.addHoliday = exports.getAvailabilityInfo = exports.generateAdvancePayment = exports.changeBookingStatus = exports.getPlannerBookingDetails = exports.getAllPlannerBookings = exports.registerEventPlannerService = exports.getEventPlannerService = exports.getEventPlannerDashboard = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const eventPlanner_service_1 = __importDefault(require("../../services/eventPlanner.service"));
const vendor_service_1 = __importDefault(require("../../services/vendor.service"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const eventPlannerService = new eventPlanner_service_1.default();
const vendorService = new vendor_service_1.default();
const getEventPlannerDashboard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const eventPlannerData = yield eventPlannerService.getDashboardData((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    console.log("i am here in eventplanner dashboard", eventPlannerData);
    (0, responseFormatter_1.default)(200, Object.assign({}, eventPlannerData), "successfull", res, req);
}));
exports.getEventPlannerDashboard = getEventPlannerDashboard;
const getEventPlannerService = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const eventPlannerData = yield eventPlannerService.getEventPlanner({ vendorId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id });
    (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfull", res, req);
}));
exports.getEventPlannerService = getEventPlannerService;
const registerEventPlannerService = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const companyInfo = (_c = req.body) === null || _c === void 0 ? void 0 : _c.companyInfo;
    const addressInfo = (_d = req.body) === null || _d === void 0 ? void 0 : _d.addressInfo;
    const description = req.body.description;
    const services = req.body.services;
    const plannedCities = req.body.plannedCities;
    const files = req.files;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new customError_1.BadRequestError('Validation failed');
    }
    if (companyInfo && addressInfo && description && services && plannedCities) {
        yield eventPlannerService.createEventPlanner(Object.assign(Object.assign({}, companyInfo), { addressInfo, description, service: services, plannedCities, user: req.user }), files);
    }
    (0, responseFormatter_1.default)(200, null, "successfull", res, req);
}));
exports.registerEventPlannerService = registerEventPlannerService;
const getAllPlannerBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield eventPlannerService.getAllBookings({ vendorId: req.user.id });
    (0, responseFormatter_1.default)(200, { bookings }, "successfull", res, req);
}));
exports.getAllPlannerBookings = getAllPlannerBookings;
const getPlannerBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const bookingData = yield eventPlannerService.getOneBooking(bookingId);
    (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
}));
exports.getPlannerBookingDetails = getPlannerBookingDetails;
const changeBookingStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { bookingId } = req.params;
    const { status } = req.body;
    const bookingData = yield eventPlannerService.changeBookingStatus(bookingId, status, (_e = req.user) === null || _e === void 0 ? void 0 : _e.id);
    (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
}));
exports.changeBookingStatus = changeBookingStatus;
const generateAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { advancePayment, bookingId } = req.body.formValue;
    const bookingData = yield eventPlannerService.generateAdvancePayment(bookingId, advancePayment);
    console.log(bookingData, "bookingData", bookingId, advancePayment);
    (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
}));
exports.generateAdvancePayment = generateAdvancePayment;
const getAvailabilityInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const availabilityData = yield eventPlannerService.getAvailabilityInfo((_f = req === null || req === void 0 ? void 0 : req.user) === null || _f === void 0 ? void 0 : _f.id);
    console.log(availabilityData, "availability data");
    (0, responseFormatter_1.default)(200, { availabilityData }, "successfull", res, req);
}));
exports.getAvailabilityInfo = getAvailabilityInfo;
const addHoliday = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const { date } = req.body;
    const holiday = yield eventPlannerService.addHoliday((_g = req.user) === null || _g === void 0 ? void 0 : _g.id, date);
    (0, responseFormatter_1.default)(200, null, "Holiday added successfully", res, req);
}));
exports.addHoliday = addHoliday;
const addNewEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const { formValue } = req.body;
    const holiday = yield eventPlannerService.addNewEvent((_h = req.user) === null || _h === void 0 ? void 0 : _h.id, formValue);
    (0, responseFormatter_1.default)(200, null, "Holiday added successfully", res, req);
}));
exports.addNewEvent = addNewEvent;