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
const bcrypt_1 = __importDefault(require("bcrypt"));
const customError_1 = require("../errors/customError");
const vendor_repository_1 = __importDefault(require("../repositories/vendor.repository"));
const emailSend_1 = require("../utils/emailSend");
const jwToken_1 = require("../config/jwToken");
const notification_repository_1 = __importDefault(require("../repositories/notification.repository"));
const eventsVariables_1 = require("../utils/eventsVariables");
class VendorService {
    constructor() {
        this._vendorRepository = new vendor_repository_1.default();
        this._notificationrepository = new notification_repository_1.default();
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
            // Convert the plain object to a Mongoose document
            return yield this._vendorRepository.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        });
    }
    comparePassword(enteredPassword, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(enteredPassword, password);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._vendorRepository.getById(id);
        });
    }
    signupUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this._vendorRepository.getByEmail(user.email);
            if (existingUser) {
                if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.isVerified) {
                    throw new customError_1.ConflictError("Email already exists");
                }
                else {
                    yield this._vendorRepository.delete(existingUser.id);
                }
            }
            const otp = yield (0, emailSend_1.sendOtpByEmail)(user === null || user === void 0 ? void 0 : user.email);
            // Save OTP in database or in-memory store for verification
            yield this.createUser(Object.assign(Object.assign({}, user), { otp, otpTimestamp: new Date() }));
            return true;
        });
    }
    otpVerification(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._vendorRepository.getByEmail(email);
            if (user && (user === null || user === void 0 ? void 0 : user.isVerified))
                throw new customError_1.ConflictError('User Already Exist!');
            if (!(user === null || user === void 0 ? void 0 : user.otp) || !(user === null || user === void 0 ? void 0 : user.otpTimestamp) || (user === null || user === void 0 ? void 0 : user.otp) !== otp) {
                throw new customError_1.BadRequestError("Invalid OTP");
            }
            const currentTime = new Date();
            const otpTimestamp = new Date(user === null || user === void 0 ? void 0 : user.otpTimestamp);
            const timeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
            if (timeDifferenceInMinutes > 2)
                throw new customError_1.BadRequestError("OTP is Expired"); // OTP expired
            // Update user in database
            yield this._vendorRepository.update({ email }, {
                $set: { isVerified: true },
                $unset: { otpTimestamp: '', otp: '' }
            });
            yield (0, emailSend_1.welcomeEmail)(email);
            const notificationDocument = {
                userId: user.id,
                userType: 'Vendor',
                message: `Welcome to our platform! Your account has been created successfully.`,
                isRead: false,
                notificationType: eventsVariables_1.NotificationType.SIGNUP
            };
            yield this._notificationrepository.create(notificationDocument);
            return true;
        });
    }
    resendOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._vendorRepository.getByEmail(email);
            if (user) {
                if (user === null || user === void 0 ? void 0 : user.isVerified) {
                    throw new customError_1.ConflictError('User is already verified');
                }
            }
            else {
                throw new customError_1.UnauthorizedError('User not found');
            }
            const otp = yield (0, emailSend_1.sendOtpByEmail)(user === null || user === void 0 ? void 0 : user.email);
            yield this._vendorRepository.update({ email }, {
                $set: { otp, otpTimestamp: new Date() },
            });
            return true;
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._vendorRepository.getOneByFilter({ email });
            if (user && (user === null || user === void 0 ? void 0 : user.isBlocked))
                throw new customError_1.ForbiddenError('User is blocked');
            if (user && (user === null || user === void 0 ? void 0 : user.isVerified) && (user === null || user === void 0 ? void 0 : user.password) && (yield this.comparePassword(password, user === null || user === void 0 ? void 0 : user.password))) {
                const accessToken = (0, jwToken_1.generateVendorToken)(user.id, user.role);
                const refreshToken = (0, jwToken_1.generateRefreshVendorToken)(user.id, user.role);
                const vendor = this.extractUserData(user);
                return { accessToken, refreshToken, vendor };
            }
            else {
                throw new customError_1.UnauthorizedError('Invalid email or password');
            }
        });
    }
    extractUserData(user) {
        const extracted = Object.assign(Object.assign(Object.assign({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }, ((user === null || user === void 0 ? void 0 : user.serviceName) && { serviceName: user === null || user === void 0 ? void 0 : user.serviceName })), { vendorType: user.vendorType, role: user.role }), ((user === null || user === void 0 ? void 0 : user.mobile) && { mobile: user.mobile }));
        return extracted;
    }
    getVendor(id, vendorType) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this._vendorRepository.getVendor(id);
            console.log(vendor === null || vendor === void 0 ? void 0 : vendor.vendorType, vendorType);
            if ((vendor === null || vendor === void 0 ? void 0 : vendor.vendorType) !== vendorType || !vendor) {
                return null;
            }
            return vendor;
        });
    }
    getAllVendors() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._vendorRepository.getAll({});
        });
    }
    blockUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._vendorRepository.block(id);
        });
    }
    unblockUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._vendorRepository.unblock(id);
        });
    }
    // async getNotifications(userId: string): Promise<INotification[] | null>{
    //     const notifications = await this._notificationrepository.getAllByFilter({ userId });
    //     return notifications;
    // }
    updateVendor(vendorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedData = yield this._vendorRepository.update({ _id: vendorId }, data);
            return updatedData;
        });
    }
}
exports.default = VendorService;
