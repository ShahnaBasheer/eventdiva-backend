"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshVendorToken = exports.generateVendorToken = exports.generateRefreshAdminToken = exports.generateAdminToken = exports.generateRefreshCustomerToken = exports.generateCustomerToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateCustomerToken = (id, role) => {
    if (!process.env.JWT_CUSTOMER_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_CUSTOMER_SECRET, { expiresIn: "15m" });
};
exports.generateCustomerToken = generateCustomerToken;
const generateRefreshCustomerToken = (id, role) => {
    if (!process.env.JWT_REFRESH_CUSTOMER_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_REFRESH_CUSTOMER_SECRET, { expiresIn: "3d" });
};
exports.generateRefreshCustomerToken = generateRefreshCustomerToken;
const generateAdminToken = (id, role) => {
    if (!process.env.JWT_ADMIN_SECRET) {
        throw new Error("JWT_ADMIN_SECRET is not defined in the environment variables.");
    }
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_ADMIN_SECRET, { expiresIn: "15m" });
};
exports.generateAdminToken = generateAdminToken;
const generateRefreshAdminToken = (id, role) => {
    if (!process.env.JWT_REFRESH_ADMIN_SECRET) {
        throw new Error("JWT_ADMIN_SECRET is not defined in the environment variables.");
    }
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_REFRESH_ADMIN_SECRET, { expiresIn: "2d" });
};
exports.generateRefreshAdminToken = generateRefreshAdminToken;
const generateVendorToken = (id, role) => {
    if (!process.env.JWT_VENDOR_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_VENDOR_SECRET, { expiresIn: "15m" });
};
exports.generateVendorToken = generateVendorToken;
const generateRefreshVendorToken = (id, role) => {
    if (!process.env.JWT_REFRESH_VENDOR_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_REFRESH_VENDOR_SECRET, { expiresIn: "3d" });
};
exports.generateRefreshVendorToken = generateRefreshVendorToken;
