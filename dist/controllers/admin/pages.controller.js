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
exports.plannerStatusApproval = exports.venueStatusApproval = exports.getEventPlannerDetail = exports.getVenueDetail = exports.getAllPlannersBookings = exports.getAllVenuesBookings = exports.getAllPlanners = exports.getAllVenues = exports.getAllVendors = exports.getAllCustomers = exports.getAdminDashBoard = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const important_variables_1 = require("../../utils/important-variables");
const dependencyContainer_1 = require("../../config/dependencyContainer");
const adminService = new admin_service_1.default();
const getAdminDashBoard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield adminService.getDashboardData();
    console.log(data, "all data");
    (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfull", res, req);
}));
exports.getAdminDashBoard = getAdminDashBoard;
const getAllCustomers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const customers = yield dependencyContainer_1.userService.getAllUsers(page, limit, important_variables_1.UserRole.Customer);
    (0, responseFormatter_1.default)(200, Object.assign({ customers: customers.users }, customers), "successfull", res, req);
}));
exports.getAllCustomers = getAllCustomers;
const getAllVendors = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const vendors = yield dependencyContainer_1.userService.getAllUsers(page, limit, important_variables_1.UserRole.Vendor);
    (0, responseFormatter_1.default)(200, Object.assign({}, vendors), "successfull", res, req);
}));
exports.getAllVendors = getAllVendors;
const getAllVenues = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const venues = yield dependencyContainer_1.venueVendorService.getAllVenues(page, limit);
    (0, responseFormatter_1.default)(200, Object.assign({}, venues), "successfull", res, req);
}));
exports.getAllVenues = getAllVenues;
const getAllPlanners = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const eventPlanners = yield dependencyContainer_1.eventPlannerService.getAllEventPlanners(page, limit);
    (0, responseFormatter_1.default)(200, Object.assign({}, eventPlanners), "successfull", res, req);
}));
exports.getAllPlanners = getAllPlanners;
const getAllVenuesBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const bookings = yield dependencyContainer_1.venueVendorService.getAllvenueBookings({}, page, limit);
    (0, responseFormatter_1.default)(200, Object.assign({}, bookings), "successfull", res, req);
}));
exports.getAllVenuesBookings = getAllVenuesBookings;
const getAllPlannersBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const bookings = yield dependencyContainer_1.eventPlannerService.getAllplannerBookings({}, page, limit);
    (0, responseFormatter_1.default)(200, Object.assign({}, bookings), "successfull", res, req);
}));
exports.getAllPlannersBookings = getAllPlannersBookings;
const getVenueDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const venueData = yield dependencyContainer_1.venueVendorService.getVenue({ slug });
    console.log(venueData);
    (0, responseFormatter_1.default)(200, { venueData }, "successfully fetch venue detail", res, req);
}));
exports.getVenueDetail = getVenueDetail;
const getEventPlannerDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const eventPlannerData = yield dependencyContainer_1.eventPlannerService.getEventPlanner({ slug });
    (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfully fetch event planner detail", res, req);
}));
exports.getEventPlannerDetail = getEventPlannerDetail;
const venueStatusApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug, status } = req.params;
    const venueData = yield dependencyContainer_1.venueVendorService.venueStatusChange(slug, status);
    (0, responseFormatter_1.default)(200, { venueData }, "successfully Approved venue", res, req);
}));
exports.venueStatusApproval = venueStatusApproval;
const plannerStatusApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug, status } = req.params;
    const plannerData = yield dependencyContainer_1.eventPlannerService.plannerStatusChange(slug, status);
    (0, responseFormatter_1.default)(200, { plannerData }, "successfully Approved venue", res, req);
}));
exports.plannerStatusApproval = plannerStatusApproval;
