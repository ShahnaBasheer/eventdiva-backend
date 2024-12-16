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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const dependencyContainer_1 = require("../config/dependencyContainer");
const responseFormatter_1 = __importDefault(require("../utils/responseFormatter"));
const customError_1 = require("../errors/customError");
const helperFunctions_1 = require("../utils/helperFunctions");
class CommonController {
    // Fetch All Event Planners
    constructor(sharedService, venueVendorService, eventPlannerService) {
        this.sharedService = sharedService;
        this.venueVendorService = venueVendorService;
        this.eventPlannerService = eventPlannerService;
        this.getVenue = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const filter = (0, helperFunctions_1.generateServiceFilter)(req.user, (_a = req.params) === null || _a === void 0 ? void 0 : _a.slug);
            const venueData = yield this.venueVendorService.getVenue(filter);
            if (!venueData) {
                throw new customError_1.NotFoundError("Venue not found");
            }
            (0, responseFormatter_1.default)(200, { venueData }, 'Successfull', res, req);
        }));
        this.getEventPlanner = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const filter = (0, helperFunctions_1.generateServiceFilter)(req.user, (_a = req.params) === null || _a === void 0 ? void 0 : _a.slug);
            const eventPlannerData = yield this.eventPlannerService.getEventPlanner(filter);
            if (!eventPlannerData) {
                throw new customError_1.NotFoundError("Event planner not found");
            }
            (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfull", res, req);
        }));
    }
}
exports.default = new CommonController(dependencyContainer_1.sharedService, dependencyContainer_1.venueVendorService, dependencyContainer_1.eventPlannerService);
