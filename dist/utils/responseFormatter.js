"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_service_1 = __importDefault(require("../services/customer.service"));
const admin_service_1 = __importDefault(require("../services/admin.service"));
const vendor_service_1 = __importDefault(require("../services/vendor.service"));
const customerService = new customer_service_1.default();
const adminService = new admin_service_1.default();
const vendorService = new vendor_service_1.default();
const createSuccessResponse = (statusCode, info, message, res, req) => {
    var _a, _b, _c;
    let data = {};
    if (info)
        data = Object.assign({}, info);
    if (req) {
        if (req.token)
            data.token = req.token;
        if (req.user) {
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) == 'customer') {
                data.user = customerService.extractUserData(req.user);
            }
            else if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) == 'admin') {
                data.user = adminService.extractUserData(req.user);
            }
            else if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) == 'vendor') {
                data.user = vendorService.extractUserData(req.user);
            }
        }
    }
    res.status(statusCode).json({ status: 'success', data, message });
};
exports.default = createSuccessResponse;
