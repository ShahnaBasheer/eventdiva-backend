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
exports.signupCustomer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const customer_service_1 = __importDefault(require("../../services/customer.service"));
const customerService = new customer_service_1.default();
const signupCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }
    const { email, password, firstName, lastName } = req.body;
    const user = { email, password, firstName, lastName };
    try {
        const newUser = yield customerService.signupUser(user);
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error signing up user:', error);
        res.status(400).json({ message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to sign up user' });
    }
}));
exports.signupCustomer = signupCustomer;
