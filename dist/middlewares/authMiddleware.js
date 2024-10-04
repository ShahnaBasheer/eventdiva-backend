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
exports.validateSocketUser = exports.authenticateSocket = exports.isUser = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const customError_1 = require("../errors/customError");
const helperFunctions_1 = require("../utils/helperFunctions");
const eventPlanner_service_1 = __importDefault(require("../services/eventPlanner.service"));
const venueVendor_service_1 = __importDefault(require("../services/venueVendor.service"));
const important_variables_1 = require("../utils/important-variables");
const eventPlannerService = new eventPlanner_service_1.default();
const venueVendorService = new venueVendor_service_1.default();
const authMiddleware = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let role;
    try {
        const authorizationHeader = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            throw new customError_1.UnauthorizedError("Not authorized: no Bearer");
        }
        const accessToken = authorizationHeader.split(" ")[1];
        if (!accessToken) {
            throw new customError_1.UnauthorizedError("Not authorized: no access token");
        }
        const decoded = jsonwebtoken_1.default.decode(accessToken);
        role = decoded.role;
        const user = yield (0, helperFunctions_1.verifyToken)(accessToken, role, 1);
        if (!user)
            throw new customError_1.UnauthorizedError("User not found!");
        if (user.isBlocked) {
            let tokenKey = role === important_variables_1.UserRole.Customer
                ? process.env.CUSTOMER_REFRESH
                : process.env.VENDOR_REFRESH;
            res.clearCookie(tokenKey);
            throw new customError_1.ForbiddenError("User account is blocked");
        }
        if (user && role === important_variables_1.UserRole.Vendor && (0, helperFunctions_1.isVendorDocument)(user)) {
            if (user.vendorType === important_variables_1.VendorType.EventPlanner) {
                const eventPlanner = yield eventPlannerService.getEventPlanner({
                    vendorId: user.id,
                });
                if (eventPlanner) {
                    user.serviceName = eventPlanner.company;
                }
            }
            else if (user.vendorType === important_variables_1.VendorType.VenueVendor) {
                const venueVendor = yield venueVendorService.getVenue({
                    vendorId: user.id,
                });
                if (venueVendor) {
                    user.serviceName = venueVendor.venueName;
                }
            }
        }
        req.user = user;
        return next();
    }
    catch (error) {
        console.log(error.message, "line 75 authmiddleware");
        let tokenKey;
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            let refreshToken;
            if (role === important_variables_1.UserRole.Admin) {
                tokenKey = process.env.ADMIN_REFRESH;
            }
            else if (role === important_variables_1.UserRole.Customer) {
                tokenKey = process.env.CUSTOMER_REFRESH;
            }
            else if (role === important_variables_1.UserRole.Vendor) {
                tokenKey = process.env.VENDOR_REFRESH;
            }
            refreshToken = req === null || req === void 0 ? void 0 : req.cookies[tokenKey];
            if (!refreshToken && role === important_variables_1.UserRole.Customer)
                return next();
            if (!refreshToken &&
                (role === important_variables_1.UserRole.Admin || role === important_variables_1.UserRole.Vendor)) {
                throw new customError_1.UnauthorizedError(`Refreshtoken is not found! ${role}`);
            }
            try {
                const user = yield (0, helperFunctions_1.verifyToken)(refreshToken, role, 2);
                if (!user)
                    throw new customError_1.UnauthorizedError("User not found!");
                if (user.isBlocked) {
                    throw new customError_1.ForbiddenError("User account is blocked");
                }
                const token = (0, helperFunctions_1.generateNewToken)(user.id, user.role);
                console.log("new token has been generated and stored");
                req.user = user;
                req.token = token;
            }
            catch (error) {
                res.clearCookie(tokenKey);
                if (error instanceof customError_1.ForbiddenError ||
                    error instanceof customError_1.UnauthorizedError)
                    throw error;
                console.log(error === null || error === void 0 ? void 0 : error.message, "session expired");
            }
        }
        else if (error instanceof customError_1.ForbiddenError) {
            throw error;
        }
        return next();
    }
}));
exports.authMiddleware = authMiddleware;
// Check ifCustomer is authorized
const isUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req === null || req === void 0 ? void 0 : req.user) {
        return next();
    }
    throw new customError_1.UnauthorizedError("Authorization Failed!");
}));
exports.isUser = isUser;
// WebSocket Authentication Middleware
const authenticateSocket = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    let role;
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
            return next(new customError_1.UnauthorizedError("Not authorized: no token provided"));
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        role = decoded.role;
        const user = yield tokenVerify(token, role, 1);
        socket.user = user; // Attach the user to the socket
        return next();
    }
    catch (error) {
        let tokenKey;
        console.log(error.message, "in authenticateSocket");
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            // Handle token expiration based on role
            tokenKey =
                role === important_variables_1.UserRole.Customer
                    ? process.env.CUSTOMER_REFRESH
                    : process.env.VENDOR_REFRESH;
            const refreshToken = (_c = (_b = socket.handshake.headers.cookie) === null || _b === void 0 ? void 0 : _b.split("; ").find((cookie) => cookie.startsWith(tokenKey))) === null || _c === void 0 ? void 0 : _c.split("=")[1];
            if (!refreshToken)
                return next(new customError_1.UnauthorizedError("Refresh token not found!"));
            try {
                const user = yield tokenVerify(refreshToken, role, 2);
                const newToken = (0, helperFunctions_1.generateNewToken)(user.id, user.role);
                socket.user = user;
                console.log("New token generated during socket connection");
                socket.emit("new-token", { token: newToken }); // Emit new token to the client
                return next();
            }
            catch (refreshError) {
                console.log("Unable to refresh token", refreshError === null || refreshError === void 0 ? void 0 : refreshError.message);
            }
        }
        else if (error instanceof customError_1.ForbiddenError) {
            return next(new customError_1.ForbiddenError("User account is blocked"));
        }
        else {
            console.log("Authentication error:", error === null || error === void 0 ? void 0 : error.message);
            return next(new customError_1.UnauthorizedError("Authentication error"));
        }
    }
});
exports.authenticateSocket = authenticateSocket;
const validateSocketUser = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    if (!socket.user) {
        throw new customError_1.UnauthorizedError("User not authenticated");
    }
    let role = socket.user.role;
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    try {
        const user = yield tokenVerify(token, socket.user.role, 1);
        socket.user = user;
    }
    catch (error) {
        let tokenKey;
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            tokenKey =
                role === important_variables_1.UserRole.Customer
                    ? process.env.CUSTOMER_REFRESH
                    : process.env.VENDOR_REFRESH;
            const refreshToken = (_e = (_d = socket.handshake.headers.cookie) === null || _d === void 0 ? void 0 : _d.split("; ").find((cookie) => cookie.startsWith(tokenKey))) === null || _e === void 0 ? void 0 : _e.split("=")[1];
            if (!refreshToken) {
                throw new customError_1.UnauthorizedError("Refresh token not found!");
            }
            try {
                const user = yield tokenVerify(refreshToken, role, 2);
                socket.user = user;
                const newToken = (0, helperFunctions_1.generateNewToken)(user.id, role);
                console.log("new token is generated in the socket events");
                socket.emit("new-token", { token: newToken }); // Emit new token if refreshed
                return true;
            }
            catch (refreshError) {
                throw new customError_1.UnauthorizedError("Unable to refresh token");
            }
        }
        else {
            throw new customError_1.UnauthorizedError("Authentication error");
        }
    }
    return true;
});
exports.validateSocketUser = validateSocketUser;
function tokenVerify(token, role, num) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, helperFunctions_1.verifyToken)(token, role, num);
        if (!user) {
            throw new customError_1.UnauthorizedError("User not found!");
        }
        if (user.isBlocked) {
            throw new customError_1.ForbiddenError("User account is blocked");
        }
        return user;
    });
}
