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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../errors/customError");
const responseFormatter_1 = __importDefault(require("../utils/responseFormatter"));
const important_variables_1 = require("../utils/important-variables");
const dependencyContainer_1 = require("../config/dependencyContainer");
class AdminController {
    constructor(adminService, userService, eventPlannerService, venueVendorService) {
        this.adminService = adminService;
        this.userService = userService;
        this.eventPlannerService = eventPlannerService;
        this.venueVendorService = venueVendorService;
        // Admin Login
        this.loginAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new customError_1.BadRequestError("Validation failed");
            }
            const data = yield this.userService.loginUser(email, password, important_variables_1.UserRole.Admin);
            if (data) {
                res.cookie(process.env.ADMIN_REFRESH, data === null || data === void 0 ? void 0 : data.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
                });
                (0, responseFormatter_1.default)(200, { token: data.accessToken, user: data.user }, "Admin successfully logged in", res);
            }
        }));
        // Admin Signup
        this.signupAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new customError_1.BadRequestError("Validation failed");
            }
            const response = yield this.userService.signupUser({ email, password, firstName, lastName }, important_variables_1.UserRole.Admin);
            if (response) {
                (0, responseFormatter_1.default)(201, null, "Admin successfully signed up!", res);
            }
        }));
        // Admin Logout
        this.logoutAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req === null || req === void 0 ? void 0 : req.cookies[process.env.ADMIN_REFRESH];
            if (!refreshToken) {
                console.log("No refresh token in cookies");
                throw new customError_1.UnauthorizedError("Something went wrong!");
            }
            // Clear the refresh token cookie
            res.clearCookie(process.env.ADMIN_REFRESH);
            (0, responseFormatter_1.default)(200, null, "Admin successfully logged out!", res);
        }));
        // Block Customer
        this.blockCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.adminService.blockUser(id, important_variables_1.UserRole.Customer);
            (0, responseFormatter_1.default)(200, null, "Customer successfully blocked!", res);
        }));
        // Unblock Customer
        this.unblockCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.adminService.unblockUser(id, important_variables_1.UserRole.Customer);
            (0, responseFormatter_1.default)(200, null, "Customer successfully unblocked!", res);
        }));
        // Block Vendor
        this.blockVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.adminService.blockUser(id, important_variables_1.UserRole.Vendor);
            (0, responseFormatter_1.default)(200, null, "Vendor successfully blocked!", res);
        }));
        // Unblock Vendor
        this.unblockVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.adminService.unblockUser(id, important_variables_1.UserRole.Vendor);
            (0, responseFormatter_1.default)(200, null, "Vendor successfully unblocked!", res);
        }));
        this.getAdminDashBoard = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.adminService.getDashboardData();
            (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfull", res, req);
        }));
        this.getAllCustomers = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const data = yield this.userService.getAllUsers(page, limit, important_variables_1.UserRole.Customer);
            (0, responseFormatter_1.default)(200, Object.assign({}, data), "successfull", res, req);
        }));
        this.getAllVendors = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const vendors = yield this.userService.getAllUsers(page, limit, important_variables_1.UserRole.Vendor);
            (0, responseFormatter_1.default)(200, Object.assign({}, vendors), "successfull", res, req);
        }));
        this.getAllVenues = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const venues = yield this.venueVendorService.getAllVenues(page, limit);
            (0, responseFormatter_1.default)(200, Object.assign({}, venues), "successfull", res, req);
        }));
        this.getAllPlanners = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const eventPlanners = yield this.eventPlannerService.getAllEventPlanners(page, limit);
            (0, responseFormatter_1.default)(200, Object.assign({}, eventPlanners), "successfull", res, req);
        }));
        this.getAllVenuesBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const bookings = yield this.venueVendorService.getAllvenueBookings({}, page, limit);
            (0, responseFormatter_1.default)(200, Object.assign({}, bookings), "successfull", res, req);
        }));
        this.getAllPlannersBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const bookings = yield this.eventPlannerService.getAllplannerBookings({}, page, limit);
            (0, responseFormatter_1.default)(200, Object.assign({}, bookings), "successfull", res, req);
        }));
        this.getVenueDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const venueData = yield this.venueVendorService.getVenue({ slug });
            console.log(venueData);
            (0, responseFormatter_1.default)(200, { venueData }, "successfully fetch venue detail", res, req);
        }));
        this.getEventPlannerDetail = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const eventPlannerData = yield this.eventPlannerService.getEventPlanner({
                slug,
            });
            (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfully fetch event planner detail", res, req);
        }));
        this.venueStatusApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug, status } = req.params;
            const venueData = yield this.venueVendorService.venueStatusChange(slug, status);
            (0, responseFormatter_1.default)(200, { venueData }, "successfully Approved venue", res, req);
        }));
        this.plannerStatusApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slug, status } = req.params;
            const plannerData = yield this.eventPlannerService.plannerStatusChange(slug, status);
            (0, responseFormatter_1.default)(200, { plannerData }, "successfully Approved venue", res, req);
        }));
    }
}
const adminController = new AdminController(dependencyContainer_1.adminService, dependencyContainer_1.userService, dependencyContainer_1.eventPlannerService, dependencyContainer_1.venueVendorService);
exports.default = adminController;
