"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminModel_1 = __importDefault(require("../models/adminModel"));
const base_repository_1 = __importDefault(require("./base.repository"));
class AdminRepository extends base_repository_1.default {
    constructor() {
        super(adminModel_1.default);
    }
}
exports.default = AdminRepository;
