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
const customerModel_1 = __importDefault(require("../models/customerModel"));
const base_repository_1 = __importDefault(require("./base.repository"));
class CustomerRepository extends base_repository_1.default {
    constructor() {
        super(customerModel_1.default);
    }
    block(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customerModel_1.default.findByIdAndUpdate(vendorId, { isBlocked: true }, { new: true });
        });
    }
    unblock(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customerModel_1.default.findByIdAndUpdate(vendorId, { isBlocked: false }, { new: true });
        });
    }
}
exports.default = CustomerRepository;
