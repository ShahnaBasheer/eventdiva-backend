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
const dependencyContainer_1 = require("../config/dependencyContainer");
const helperFunctions_1 = require("../utils/helperFunctions");
const important_variables_1 = require("../utils/important-variables");
class AuthController {
    constructor(userService) {
        this.userService = userService;
        this.login = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new customError_1.BadRequestError("Validation failed");
            }
            const data = yield this.userService.loginUser(email, password, req.body.role);
            const refreshKey = (0, helperFunctions_1.getRefreshKey)(req.body.role) || "";
            if (data) {
                res.cookie(refreshKey, data === null || data === void 0 ? void 0 : data.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
                });
                (0, responseFormatter_1.default)(200, { token: data.accessToken, user: data.user }, `${req.body.role} successfully logged in`, res);
            }
        }));
        this.signup = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password } = req.body;
            const data = { email, password, firstName, lastName };
            if (req.body.role === important_variables_1.UserRole.Vendor) {
                data.vendorType = req.body.vendorType;
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new customError_1.BadRequestError("Validation failed");
            }
            const response = yield this.userService.signupUser(data, req.body.role);
            if (response) {
                (0, responseFormatter_1.default)(201, null, `OTP sent successfully to your email address!`, res);
            }
        }));
        this.logout = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const refreshKey = (0, helperFunctions_1.getRefreshKey)(req.user.role) || "";
            const refreshToken = req === null || req === void 0 ? void 0 : req.cookies[refreshKey];
            if (!refreshToken) {
                console.log("No refresh token in cookies");
                throw new customError_1.UnauthorizedError("Something went wrong!");
            }
            // Clear the refresh token cookie
            res.clearCookie(refreshKey);
            (0, responseFormatter_1.default)(200, null, `${req.user.role} successfully logged out!`, res);
        }));
        // Google Sign-In
        this.signinWithGoogle = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { idToken } = req.body;
            const data = yield this.userService.verifyWithGoogle(idToken, req.body.role);
            const refreshKey = (0, helperFunctions_1.getRefreshKey)(req.body.role) || "";
            if (data) {
                res.cookie(refreshKey, data.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3 * 24 * 60 * 60 * 1000,
                });
                (0, responseFormatter_1.default)(200, { token: data.accessToken, user: data.user }, "Successfully Logged In", res);
            }
        }));
        this.verifyOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, otp } = req.body;
            const isVerified = yield this.userService.otpVerification(email, otp, req.body.role);
            if (isVerified) {
                (0, responseFormatter_1.default)(200, null, 'You have successfully signed up! Please Login', res);
            }
        }));
        this.resendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const result = yield this.userService.resendOtp(email, req.body.role);
            const remainingLimit = res.getHeader('X-RateLimit-Remaining');
            if (result) {
                (0, responseFormatter_1.default)(201, { email, remainingLimit }, 'OTP resent successfully to your email address', res);
            }
        }));
    }
}
exports.default = new AuthController(dependencyContainer_1.userService);
