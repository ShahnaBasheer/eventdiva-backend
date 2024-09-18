"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVendorSignup = exports.validateAdmin = exports.validateLogin = exports.validateSignup = void 0;
const express_validator_1 = require("express-validator");
const validateSignup = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First Name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
];
exports.validateSignup = validateSignup;
const validateLogin = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
];
exports.validateLogin = validateLogin;
const validateAdmin = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('First Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
];
exports.validateAdmin = validateAdmin;
const validateVendorSignup = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First Name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
    (0, express_validator_1.body)('vendorType').notEmpty().withMessage('vendorType is required')
        .isIn(['event-planner', 'venue-vendor', 'photographer', 'food-vendor']),
];
exports.validateVendorSignup = validateVendorSignup;
