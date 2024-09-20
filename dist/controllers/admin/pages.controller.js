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
const customer_service_1 = __importDefault(require("../../services/customer.service"));
const vendor_service_1 = __importDefault(require("../../services/vendor.service"));
const venueVendor_service_1 = __importDefault(require("../../services/venueVendor.service"));
const eventPlanner_service_1 = __importDefault(require("../../services/eventPlanner.service"));
const customerService = new customer_service_1.default();
const vendorService = new vendor_service_1.default();
const venueService = new venueVendor_service_1.default();
const eventPlannerService = new eventPlanner_service_1.default();
const adminService = new admin_service_1.default();
const getAdminDashBoard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield adminService.getDashboardData();
    console.log(data, "all data");
    (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfull", res, req);
}));
exports.getAdminDashBoard = getAdminDashBoard;
const getAllCustomers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customers = yield customerService.getCustomers();
    (0, responseFormatter_1.default)(200, { customers }, "successfull", res, req);
}));
exports.getAllCustomers = getAllCustomers;
const getAllVendors = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vendors = yield vendorService.getAllVendors();
    (0, responseFormatter_1.default)(200, { vendors }, "successfull", res, req);
}));
exports.getAllVendors = getAllVendors;
const getAllVenues = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const venues = yield venueService.getAllVenues({});
    (0, responseFormatter_1.default)(200, { venues }, "successfull", res, req);
}));
exports.getAllVenues = getAllVenues;
const getAllPlanners = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventPlanners = yield eventPlannerService.getAllEventPlanners({});
    (0, responseFormatter_1.default)(200, { eventPlanners }, "successfull", res, req);
}));
exports.getAllPlanners = getAllPlanners;
const getAllVenuesBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield venueService.getAllvenueBookings({});
    (0, responseFormatter_1.default)(200, { bookings }, "successfull", res, req);
}));
exports.getAllVenuesBookings = getAllVenuesBookings;
const getAllPlannersBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield eventPlannerService.getAllplannerBookings({});
    (0, responseFormatter_1.default)(200, { bookings }, "successfull", res, req);
}));
exports.getAllPlannersBookings = getAllPlannersBookings;
const getVenueDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    console.log(slug, "heyyyyyyy");
    const venueData = yield venueService.getVenue({ slug });
    (0, responseFormatter_1.default)(200, { venueData }, "successfully fetch venue detail", res, req);
}));
exports.getVenueDetail = getVenueDetail;
const getEventPlannerDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const eventPlannerData = yield eventPlannerService.getEventPlanner({ slug });
    (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfully fetch event planner detail", res, req);
}));
exports.getEventPlannerDetail = getEventPlannerDetail;
const venueStatusApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug, status } = req.params;
    const venueData = yield venueService.venueStatusChange(slug, status);
    (0, responseFormatter_1.default)(200, { venueData }, "successfully Approved venue", res, req);
}));
exports.venueStatusApproval = venueStatusApproval;
const plannerStatusApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug, status } = req.params;
    const plannerData = yield eventPlannerService.plannerStatusChange(slug, status);
    (0, responseFormatter_1.default)(200, { plannerData }, "successfully Approved venue", res, req);
}));
exports.plannerStatusApproval = plannerStatusApproval;
