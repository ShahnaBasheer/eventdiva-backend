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
const base_repository_1 = __importDefault(require("./base.repository"));
;
const eventPlannerBookingModel_1 = __importDefault(require("../models/eventPlannerBookingModel"));
class PlannerBookingRepository extends base_repository_1.default {
    constructor() {
        super(eventPlannerBookingModel_1.default);
    }
    registerBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield eventPlannerBookingModel_1.default.create(data);
            if (!booking) {
                throw new Error('Failed to register booking');
            }
            return booking;
        });
    }
    getOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eventPlannerBookingModel_1.default.findOne(Object.assign({}, filter))
                .populate('address')
                .populate('eventPlannerId')
                .exec();
        });
    }
    getAllBookings(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eventPlannerBookingModel_1.default.find(Object.assign({}, filter))
                .populate('address')
                .populate('eventPlannerId')
                .populate('customerId')
                .exec();
        });
    }
    getBookings(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eventPlannerBookingModel_1.default.find(Object.assign({}, filter))
                .populate('address')
                .populate('eventPlannerId')
                .sort({ createdAt: -1 })
                .exec();
        });
    }
    getOneBooking(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eventPlannerBookingModel_1.default.findOne(Object.assign({}, filter))
                .populate('address')
                .populate('eventPlannerId')
                .populate('customerId')
                .exec();
        });
    }
    getAggregateData(pipeline) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield eventPlannerBookingModel_1.default.aggregate(pipeline);
                return data;
            }
            catch (error) {
                console.error('Error performing aggregation:', error);
                return null;
            }
        });
    }
}
exports.default = PlannerBookingRepository;
