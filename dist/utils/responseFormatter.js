"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const vendor_repository_1 = __importDefault(require("../repositories/vendor.repository"));
const admin_repository_1 = __importDefault(require("../repositories/admin.repository"));
const customer_repository_1 = __importDefault(require("../repositories/customer.repository"));
const notification_repository_1 = __importDefault(require("../repositories/notification.repository"));
const userService = new user_service_1.default(new vendor_repository_1.default(), new admin_repository_1.default(), new customer_repository_1.default(), new notification_repository_1.default());
const createSuccessResponse = (statusCode, info, message, res, req) => {
    let data = {};
    if (info)
        data = Object.assign({}, info);
    if (req) {
        if (req.token)
            data.token = req.token;
        if (req.user) {
            data.user = userService.extractUserData(req.user);
        }
    }
    res.status(statusCode).json({ status: 'success', data, message });
};
exports.default = createSuccessResponse;
