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
    constructor(venueVendorService, eventPlannerService, chatroomService, notificationService) {
        this.venueVendorService = venueVendorService;
        this.eventPlannerService = eventPlannerService;
        this.chatroomService = chatroomService;
        this.notificationService = notificationService;
        this.getVenue = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const filter = (0, helperFunctions_1.generateServiceFilter)((_a = req.user) !== null && _a !== void 0 ? _a : { role: req.body.role }, (_b = req.params) === null || _b === void 0 ? void 0 : _b.slug);
            const venueData = yield this.venueVendorService.getVenue(filter);
            if (!venueData) {
                throw new customError_1.NotFoundError("Venue not found");
            }
            (0, responseFormatter_1.default)(200, { venueData }, 'Successfull', res, req);
        }));
        this.getEventPlanner = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const filter = (0, helperFunctions_1.generateServiceFilter)((_a = req.user) !== null && _a !== void 0 ? _a : { role: req.body.role }, (_b = req.params) === null || _b === void 0 ? void 0 : _b.slug);
            const eventPlannerData = yield this.eventPlannerService.getEventPlanner(filter);
            if (!eventPlannerData) {
                throw new customError_1.NotFoundError("Event planner not found");
            }
            (0, responseFormatter_1.default)(200, { eventPlannerData }, "successfull", res, req);
        }));
        this.markMessageRead = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { messageIds, roomId } = req.body;
            if (!Array.isArray(messageIds))
                throw new customError_1.BadRequestError('Invalid request. Provide messageIds array');
            const message = yield this.chatroomService.markMessagesAsRead(messageIds, roomId);
            (0, responseFormatter_1.default)(200, { message }, `Message ${messageIds} in chatroom ${roomId} marked as read.`, res, req);
        }));
        this.notificationReadStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const notification = yield this.notificationService.updateReadStatus(req.body.id);
            (0, responseFormatter_1.default)(200, { notification }, 'Read status updated successfully', res, req);
        }));
        this.deleteNotification = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const notification = yield this.notificationService.deleteNotification(req.params.id);
            (0, responseFormatter_1.default)(200, { notification }, 'Notification deleted successfully', res, req);
        }));
        this.getNotifications = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.notificationService.getNotifications(req.user.id, req.user.role);
            (0, responseFormatter_1.default)(200, { notifications: data.notifications, readCount: data.readCount }, 'Successfully retrieved notifications', res, req);
        }));
    }
}
exports.default = new CommonController(dependencyContainer_1.venueVendorService, dependencyContainer_1.eventPlannerService, dependencyContainer_1.chatroomservice, dependencyContainer_1.notificationService);
