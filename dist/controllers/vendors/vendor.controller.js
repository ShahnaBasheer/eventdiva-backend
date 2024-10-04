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
exports.passWordChangeProfile = exports.verifyEmailProfile = exports.updateEmailProfile = exports.getVendorProfile = exports.updateVendorProfile = exports.changeReadStatus = exports.deleteNotification = exports.getNotifications = exports.logout = exports.loginVendor = exports.resendOtp = exports.verifyOtp = exports.signupVendor = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const vendor_service_1 = __importDefault(require("../../services/vendor.service"));
const notification_service_1 = __importDefault(require("../../services/notification.service"));
const vendorService = new vendor_service_1.default();
const notificationService = new notification_service_1.default();
const signupVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new customError_1.BadRequestError('Validation failed');
        // res.status(400).json({ errors: errors.array() });
    }
    const { email, password, firstName, lastName, vendorType } = req.body;
    const response = yield vendorService.signupUser({ email, password, firstName, lastName, vendorType });
    if (response) {
        (0, responseFormatter_1.default)(201, { email }, "OTP sent successfully to your email address", res, req);
    }
}));
exports.signupVendor = signupVendor;
const verifyOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const isVerified = yield vendorService.otpVerification(email, otp);
    if (isVerified) {
        (0, responseFormatter_1.default)(200, null, "You have successfully signed up! Please Login", res);
    }
}));
exports.verifyOtp = verifyOtp;
const resendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield vendorService.resendOTP(email);
    const remainingLimit = res.getHeader('X-RateLimit-Remaining');
    ;
    if (result) {
        (0, responseFormatter_1.default)(201, { email, remainingLimit }, "OTP resent successfully to your email address", res);
    }
}));
exports.resendOtp = resendOtp;
const loginVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new customError_1.BadRequestError('Validation failed');
    }
    const data = yield vendorService.loginUser(email, password);
    if (data) {
        res.cookie(process.env.VENDOR_REFRESH, data === null || data === void 0 ? void 0 : data.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
        });
        (0, responseFormatter_1.default)(200, { token: data.accessToken, user: data.vendor }, 'Login successful', res);
    }
}));
exports.loginVendor = loginVendor;
//logout user
const logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req === null || req === void 0 ? void 0 : req.cookies[process.env.VENDOR_REFRESH];
    if (!refreshToken) {
        console.log("no refresh token in cookies");
        throw new customError_1.UnauthorizedError("Something Went Wrong!");
    }
    // Clear both access token and refresh token cookies
    res.clearCookie(process.env.VENDOR_REFRESH);
    (0, responseFormatter_1.default)(200, null, 'Successfully Logout!', res);
}));
exports.logout = logout;
const getNotifications = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = yield notificationService.getNotifications((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, (_b = req.user) === null || _b === void 0 ? void 0 : _b.role);
    console.log(data, "notfication");
    (0, responseFormatter_1.default)(200, { notifications: data.notifications, readCount: data.readCount }, "successfull", res, req);
}));
exports.getNotifications = getNotifications;
const changeReadStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notificationService.updateReadStatus(req.body.id);
    (0, responseFormatter_1.default)(200, { notification }, "successfull", res, req);
}));
exports.changeReadStatus = changeReadStatus;
const deleteNotification = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params, "njjjcxnd");
    const notification = yield notificationService.deleteNotification(req.params.id);
    (0, responseFormatter_1.default)(200, { notification }, "successfull", res, req);
}));
exports.deleteNotification = deleteNotification;
const getVendorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const vendorDetail = yield vendorService.getVendor((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id, req.user.vendorType);
    (0, responseFormatter_1.default)(200, { vendorDetail }, "successfull", res, req);
}));
exports.getVendorProfile = getVendorProfile;
const updateVendorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { firstName, lastName, mobile } = req.body;
    const data = { firstName, lastName, mobile };
    const vendorDetail = yield vendorService.updateVendor((_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d.id, data);
    (0, responseFormatter_1.default)(200, { vendorDetail }, "successfull", res, req);
}));
exports.updateVendorProfile = updateVendorProfile;
const updateEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const vendorDetail = yield vendorService.otpSendForUpdateEmail(req === null || req === void 0 ? void 0 : req.user, email);
    (0, responseFormatter_1.default)(200, null, "OTP has been Sent Successfully!", res, req);
}));
exports.updateEmailProfile = updateEmailProfile;
const verifyEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const formValue = req.body.formValue;
    const vendorDetail = yield vendorService.otpVerifyForEmail(req === null || req === void 0 ? void 0 : req.user, formValue);
    (0, responseFormatter_1.default)(200, { vendorDetail }, "OTP has been Sent Successfully!", res, req);
}));
exports.verifyEmailProfile = verifyEmailProfile;
const passWordChangeProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const formValue = req.body.formValue;
    const vendorDetail = yield vendorService.passwordChange(req === null || req === void 0 ? void 0 : req.user, formValue);
    (0, responseFormatter_1.default)(200, null, "Paasword has been Change Successfully!", res, req);
}));
exports.passWordChangeProfile = passWordChangeProfile;
