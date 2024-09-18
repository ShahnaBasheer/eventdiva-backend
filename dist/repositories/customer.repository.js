"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customerModel_1 = __importDefault(require("../models/customerModel"));
const base_repository_1 = __importDefault(require("./base.repository"));
class CustomerRepository extends base_repository_1.default {
    constructor() {
        super(customerModel_1.default);
    }
}
exports.default = CustomerRepository;
