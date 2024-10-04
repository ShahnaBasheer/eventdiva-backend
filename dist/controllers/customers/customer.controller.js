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
exports.passWordChangeProfile = exports.verifyEmailProfile = exports.updateEmailProfile = exports.updateCustomerProfile = exports.getCustomerProfile = exports.logout = exports.signinWithGoogle = exports.loginCustomer = exports.resendOtp = exports.verifyOtp = exports.signupCustomer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const customer_service_1 = __importDefault(require("../../services/customer.service"));
const customError_1 = require("../../errors/customError");
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const customerService = new customer_service_1.default();
const signupCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new customError_1.BadRequestError('Validation failed');
        // res.status(400).json({ errors: errors.array() });
    }
    const { email, password, firstName, lastName } = req.body;
    const response = yield customerService.signupUser({ email, password, firstName, lastName });
    if (response) {
        (0, responseFormatter_1.default)(201, { email }, "OTP sent successfully to your email address", res, req);
    }
}));
exports.signupCustomer = signupCustomer;
const verifyOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const isVerified = yield customerService.otpVerification(email, otp);
    if (isVerified) {
        (0, responseFormatter_1.default)(200, null, "You have successfully signed up! Please Login", res);
    }
}));
exports.verifyOtp = verifyOtp;
const resendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield customerService.resendOTP(email);
    const remainingLimit = res.getHeader('X-RateLimit-Remaining');
    ;
    if (result) {
        (0, responseFormatter_1.default)(201, { email, remainingLimit }, "OTP resent successfully to your email address", res);
    }
}));
exports.resendOtp = resendOtp;
const loginCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new customError_1.BadRequestError('Validation failed');
    }
    const data = yield customerService.loginUser(email, password);
    if (data) {
        res.cookie(process.env.CUSTOMER_REFRESH, data === null || data === void 0 ? void 0 : data.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
        });
        (0, responseFormatter_1.default)(200, { token: data.accessToken, user: data.customer }, 'Login successful', res);
    }
}));
exports.loginCustomer = loginCustomer;
const signinWithGoogle = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    const data = yield customerService.verifyWithGoogle(idToken);
    if (data) {
        res.cookie(process.env.CUSTOMER_REFRESH, data === null || data === void 0 ? void 0 : data.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        (0, responseFormatter_1.default)(200, { token: data === null || data === void 0 ? void 0 : data.accessToken, user: data === null || data === void 0 ? void 0 : data.customer }, 'Login successful', res);
    }
}));
exports.signinWithGoogle = signinWithGoogle;
//logout user
const logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req === null || req === void 0 ? void 0 : req.cookies[process.env.CUSTOMER_REFRESH];
    if (!refreshToken) {
        throw new customError_1.UnauthorizedError("Something Went Wrong!");
    }
    // Clear both access token and refresh token cookies
    res.clearCookie(process.env.CUSTOMER_REFRESH);
    (0, responseFormatter_1.default)(200, null, 'Successfully Logout!', res);
}));
exports.logout = logout;
const getCustomerProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const customerDetail = yield customerService.getCustomer((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id, req.user.vendorType);
    (0, responseFormatter_1.default)(200, { customerDetail }, "successfull", res, req);
}));
exports.getCustomerProfile = getCustomerProfile;
const updateCustomerProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { firstName, lastName, mobile } = req.body;
    const data = { firstName, lastName, mobile };
    const customerDetail = yield customerService.updateCustomer((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id, data);
    req.user = customerDetail;
    (0, responseFormatter_1.default)(200, { customerDetail }, "successfull", res, req);
}));
exports.updateCustomerProfile = updateCustomerProfile;
const updateEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const customerDetail = yield customerService.otpSendForUpdateEmail(req === null || req === void 0 ? void 0 : req.user, email);
    (0, responseFormatter_1.default)(200, null, "OTP has been Sent Successfully!", res, req);
}));
exports.updateEmailProfile = updateEmailProfile;
const verifyEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const formValue = req.body.formValue;
    const customerDetail = yield customerService.otpVerifyForEmail(req === null || req === void 0 ? void 0 : req.user, formValue);
    req.user = customerDetail;
    (0, responseFormatter_1.default)(200, { customerDetail }, "OTP has been Sent Successfully!", res, req);
}));
exports.verifyEmailProfile = verifyEmailProfile;
const passWordChangeProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const formValue = req.body.formValue;
    const customerDetail = yield customerService.passwordChange(req === null || req === void 0 ? void 0 : req.user, formValue);
    (0, responseFormatter_1.default)(200, null, "Paasword has been Change Successfully!", res, req);
}));
exports.passWordChangeProfile = passWordChangeProfile;
