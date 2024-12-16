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
const important_variables_1 = require("../utils/important-variables");
const helperFunctions_1 = require("../utils/helperFunctions");
const emailSend_1 = require("../utils/emailSend");
const eventsVariables_1 = require("../utils/eventsVariables");
const google_auth_library_1 = require("google-auth-library");
class UserService {
    constructor(_vendorRepository, _adminRepository, _customerRepository, _notificationrepository) {
        this._vendorRepository = _vendorRepository;
        this._adminRepository = _adminRepository;
        this._customerRepository = _customerRepository;
        this._notificationrepository = _notificationrepository;
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            return yield bcrypt_1.default.hash(password, salt);
        });
    }
    comparePassword(enteredPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(enteredPassword, hashedPassword);
        });
    }
    getRepositoryByRole(role) {
        if (role === important_variables_1.UserRole.Vendor)
            return this._vendorRepository;
        if (role === important_variables_1.UserRole.Admin)
            return this._adminRepository;
        if (role === important_variables_1.UserRole.Customer)
            return this._customerRepository;
        throw new customError_1.BadRequestError('Invalid role');
    }
    createUser(user, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const repository = this.getRepositoryByRole(role);
            const hashedPassword = yield this.hashPassword(user.password);
            return yield repository.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        });
    }
    getUserById(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const repository = this.getRepositoryByRole(role);
            return yield repository.getById(id);
        });
    }
    loginUser(email, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const repository = this.getRepositoryByRole(role);
            const user = yield repository.getOneByFilter({ email });
            if (!user)
                throw new customError_1.UnauthorizedError('Invalid email or password');
            // Check if the user is blocked
            if ('isBlocked' in user && user.isBlocked) {
                throw new customError_1.ForbiddenError('User account is blocked');
            }
            const isPasswordValid = user.password && (yield this.comparePassword(password, user.password));
            if (!isPasswordValid)
                throw new customError_1.UnauthorizedError('Invalid email or password');
            const { accessToken, refreshToken } = (0, helperFunctions_1.createToken)(user.id, role);
            if (!refreshToken || !accessToken)
                throw new Error('Failed to generate authentication tokens');
            const sanitizedUser = this.extractUserData(user);
            return { accessToken, refreshToken, user: sanitizedUser };
        });
    }
    signupUser(user, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const repository = this.getRepositoryByRole(role);
            const existingUser = yield repository.getByEmail(user.email);
            if (existingUser) {
                if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.isVerified) {
                    throw new customError_1.ConflictError('Email already exists');
                }
                else {
                    yield repository.delete(existingUser.id);
                }
            }
            if (role === important_variables_1.UserRole.Admin) {
                yield this.createUser(user, role);
                return true;
            }
            const otp = yield (0, emailSend_1.sendOtpByEmail)(user.email);
            const userWithOtp = Object.assign(Object.assign({}, user), { otp, otpTimestamp: new Date() });
            yield this.createUser(userWithOtp, role);
            return true;
        });
    }
    verifyWithGoogle(idToken, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (role === important_variables_1.UserRole.Admin) {
                    throw new customError_1.BadRequestError('Google verification is not allowed for admin');
                }
                const repository = this.getRepositoryByRole(role);
                const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_ID);
                const ticket = yield client.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_ID,
                });
                const payload = ticket.getPayload();
                if (!payload) {
                    throw new customError_1.BadRequestError('Invalid payload received from Google authentication');
                }
                const { sub, given_name, family_name, email } = payload;
                console.log(payload);
                let user = yield repository.getOneByFilter({ googleId: sub });
                if (user && user.isBlocked) {
                    throw new customError_1.ForbiddenError('User account is blocked');
                }
                if (!user) {
                    if (given_name && email) {
                        // Convert the plain object to a Mongoose document
                        const userDocument = {
                            googleId: sub,
                            firstName: given_name,
                            lastName: family_name || ' ',
                            email,
                            isVerified: true,
                        };
                        user = yield repository.create(userDocument);
                        yield (0, emailSend_1.welcomeEmail)(email);
                        const notificationDocument = {
                            userId: user.id,
                            userType: (0, helperFunctions_1.capitalize)(role),
                            message: `Welcome to our platform! Your account has been created successfully.`,
                            isRead: false,
                            notificationType: eventsVariables_1.NotificationType.SIGNUP
                        };
                        yield this._notificationrepository.create(notificationDocument);
                    }
                    else {
                        throw new customError_1.BadRequestError('Missing required fields for user creation');
                    }
                }
                const { accessToken, refreshToken } = (0, helperFunctions_1.createToken)(user.id, role);
                if (!refreshToken || !accessToken)
                    throw new Error('Failed to generate authentication tokens');
                return { accessToken, refreshToken, user: this.extractUserData(user) };
            }
            catch (error) {
                console.log(error, 'Error occur during google authentication');
                if (error instanceof customError_1.ForbiddenError || error instanceof customError_1.BadRequestError)
                    throw error;
                throw new customError_1.UnauthorizedError('Authentication failed');
            }
        });
    }
    otpVerification(email, otp, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === 'admin') {
                throw new customError_1.BadRequestError('Google verification is not allowed for admin');
            }
            const repository = this.getRepositoryByRole(role);
            const user = yield repository.getByEmail(email);
            if (!user || user.otp !== otp)
                throw new customError_1.BadRequestError('Invalid OTP');
            const otpTimestamp = new Date(user.otpTimestamp);
            const currentTime = new Date();
            const timeDifference = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60); // in minutes
            if (timeDifference > 2)
                throw new customError_1.BadRequestError('OTP expired');
            yield repository.update(user.id, {
                $set: { isVerified: true },
                $unset: { otp: '', otpTimestamp: '' },
            });
            yield (0, emailSend_1.welcomeEmail)(email);
            const notificationDocument = {
                userId: user.id,
                userType: role,
                message: `Welcome to our platform! Your account has been created successfully.`,
                isRead: false,
                notificationType: eventsVariables_1.NotificationType.SIGNUP
            };
            yield this._notificationrepository.create(notificationDocument);
            return true;
        });
    }
    resendOtp(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const repository = this.getRepositoryByRole(role);
            const user = yield repository.getByEmail(email);
            if (!user)
                throw new customError_1.UnauthorizedError('User not found');
            if (user.isVerified)
                throw new customError_1.ConflictError('User is already verified');
            const otp = yield (0, emailSend_1.sendOtpByEmail)(email);
            yield repository.update(user.id, {
                $set: { otp, otpTimestamp: new Date() },
            });
            return true;
        });
    }
    extractUserData(user) {
        // Base extracted data (common fields)
        const extractedData = Object.assign(Object.assign({}, ((user === null || user === void 0 ? void 0 : user.id) && { id: user.id })), { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', role: user.role });
        // Add vendor-specific fields if user is a vendor
        if ((0, helperFunctions_1.isVendorDocument)(user) && user.role === important_variables_1.UserRole.Vendor) {
            Object.assign(extractedData, Object.assign(Object.assign({}, (user.vendorType && { vendorType: user.vendorType })), (user.serviceName && { serviceName: user.serviceName })));
        }
        // Add mobile field if present
        if ('mobile' in user && user.mobile) {
            Object.assign(extractedData, { mobile: user.mobile, });
        }
        return extractedData;
    }
}
exports.default = UserService;
