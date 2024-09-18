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
exports.unblockVendor = exports.blockVendor = exports.unblockCustomer = exports.blockCutomer = exports.logoutAdmin = exports.signupAdmin = exports.loginAdmin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const customer_service_1 = __importDefault(require("../../services/customer.service"));
const vendor_service_1 = __importDefault(require("../../services/vendor.service"));
const adminService = new admin_service_1.default();
const customerService = new customer_service_1.default();
const vendorService = new vendor_service_1.default();
const loginAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new customError_1.BadRequestError('Validation failed');
    }
    const data = yield adminService.loginUser(email, password);
    if (data) {
        res.cookie(process.env.ADMIN_REFRESH, data === null || data === void 0 ? void 0 : data.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 days
        });
        (0, responseFormatter_1.default)(200, { token: data.accessToken, user: data.admin }, 'Admin successfully logged in', res);
    }
}));
exports.loginAdmin = loginAdmin;
const signupAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new customError_1.BadRequestError('Validation failed');
    }
    const response = yield adminService.signupAdmin({ email, password, fullName });
    if (response) {
        (0, responseFormatter_1.default)(201, null, "Admin Successfully Signup!", res);
    }
}));
exports.signupAdmin = signupAdmin;
//logout user
const logoutAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req === null || req === void 0 ? void 0 : req.cookies[process.env.ADMIN_REFRESH];
    if (!refreshToken) {
        console.log("no refresh token in cookies");
        throw new customError_1.UnauthorizedError("Something Went Wrong!");
    }
    // Clear both access token and refresh token cookies
    res.clearCookie(process.env.ADMIN_REFRESH);
    (0, responseFormatter_1.default)(200, null, 'Successfully Logout admin!', res);
}));
exports.logoutAdmin = logoutAdmin;
//Block Customer
const blockCutomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield customerService.blockUser(id);
    (0, responseFormatter_1.default)(200, null, 'User successfully blocked!', res, req);
}));
exports.blockCutomer = blockCutomer;
//Unblock Customer
const unblockCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield customerService.unblockUser(id);
    (0, responseFormatter_1.default)(200, null, 'User successfully unblocked!', res, req);
}));
exports.unblockCustomer = unblockCustomer;
//Block Vendor
const blockVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield vendorService.blockUser(id);
    (0, responseFormatter_1.default)(200, null, 'User successfully blocked!', res, req);
}));
exports.blockVendor = blockVendor;
//Unblock Vendor
const unblockVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield vendorService.unblockUser(id);
    (0, responseFormatter_1.default)(200, null, 'User successfully unblocked!', res, req);
}));
exports.unblockVendor = unblockVendor;
