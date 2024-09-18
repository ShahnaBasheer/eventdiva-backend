"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addressModel_1 = __importDefault(require("../models/addressModel"));
const base_repository_1 = __importDefault(require("./base.repository"));
class AddressRepository extends base_repository_1.default {
    constructor() {
        super(addressModel_1.default);
    }
}
exports.default = AddressRepository;
