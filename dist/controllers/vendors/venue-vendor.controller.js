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
exports.addNewEvent = exports.addHoliday = exports.getAvailabilityInfo = exports.generateAdvancePayment = exports.changeBookingStatus = exports.getVenueBookingDetails = exports.getAllVenueBookings = exports.registerVenueVendorService = exports.getVenueVendorService = exports.getVenueVendorProfile = exports.getVenueVendorDashboard = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const vendor_service_1 = __importDefault(require("../../services/vendor.service"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const venueVendor_service_1 = __importDefault(require("../../services/venueVendor.service"));
const venueVendorService = new venueVendor_service_1.default();
const vendorService = new vendor_service_1.default();
const venueService = new venueVendor_service_1.default();
const getVenueVendorDashboard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("i am here in venue vendorr dashboard");
    (0, responseFormatter_1.default)(200, null, "successfull", res, req);
}));
exports.getVenueVendorDashboard = getVenueVendorDashboard;
const getVenueVendorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorDetail = yield vendorService.getVendor((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id, "venue-vendor");
    (0, responseFormatter_1.default)(200, { vendorDetail }, "successfull", res, req);
}));
exports.getVenueVendorProfile = getVenueVendorProfile;
const getVenueVendorService = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const venueVendorData = yield venueVendorService.getVenue({ vendorId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id });
    (0, responseFormatter_1.default)(200, { venueVendorData }, "successfull", res, req);
}));
exports.getVenueVendorService = getVenueVendorService;
const registerVenueVendorService = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    const venueInfo = (_c = req.body) === null || _c === void 0 ? void 0 : _c.venueInfo;
    const addressInfo = (_d = req.body) === null || _d === void 0 ? void 0 : _d.addressInfo;
    const priceInfo = (_e = req.body) === null || _e === void 0 ? void 0 : _e.priceInfo;
    const description = req.body.description;
    const services = req.body.services;
    const amenities = req.body.amenities;
    const areas = req.body.areas;
    const files = req.files;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new customError_1.BadRequestError('Validation failed');
    }
    if (venueInfo && addressInfo && description && services && amenities && priceInfo && areas) {
        yield venueVendorService.createVenue(Object.assign(Object.assign(Object.assign(Object.assign({}, venueInfo), { addressInfo }), priceInfo), { description, service: services, amenities, areas, user: req.user }), files);
    }
    (0, responseFormatter_1.default)(200, null, "successfull", res, req);
}));
exports.registerVenueVendorService = registerVenueVendorService;
const getAllVenueBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield venueService.getAllBookings({ vendorId: req.user.id });
    (0, responseFormatter_1.default)(200, { bookings }, "successfull", res, req);
}));
exports.getAllVenueBookings = getAllVenueBookings;
const getVenueBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const bookingData = yield venueService.getOneBooking(bookingId);
    (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
}));
exports.getVenueBookingDetails = getVenueBookingDetails;
const changeBookingStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const { bookingId } = req.params;
    const { status } = req.body;
    const bookingData = yield venueService.changeBookingStatus(bookingId, status, (_f = req === null || req === void 0 ? void 0 : req.user) === null || _f === void 0 ? void 0 : _f.id);
    (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
}));
exports.changeBookingStatus = changeBookingStatus;
const generateAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const { advancePayment, bookingId } = (_g = req.body) === null || _g === void 0 ? void 0 : _g.formValue;
    const bookingData = yield venueService.generateAdvancePayment(bookingId, advancePayment);
    console.log(bookingData);
    (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
}));
exports.generateAdvancePayment = generateAdvancePayment;
const getAvailabilityInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const availabilityData = yield venueService.getAvailabilityInfo((_h = req === null || req === void 0 ? void 0 : req.user) === null || _h === void 0 ? void 0 : _h.id);
    console.log(availabilityData);
    (0, responseFormatter_1.default)(200, { availabilityData }, "successfull", res, req);
}));
exports.getAvailabilityInfo = getAvailabilityInfo;
const addHoliday = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const { date } = req.body;
    const holiday = yield venueService.addHoliday((_j = req.user) === null || _j === void 0 ? void 0 : _j.id, date);
    (0, responseFormatter_1.default)(200, null, "Holiday added successfully", res, req);
}));
exports.addHoliday = addHoliday;
const addNewEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { date } = req.body;
    // const holiday = await venueService.addHoliday(req.user?.id, date);
    (0, responseFormatter_1.default)(200, null, "Holiday added successfully", res, req);
}));
exports.addNewEvent = addNewEvent;