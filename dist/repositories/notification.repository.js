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
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
class NotificationRepository extends base_repository_1.default {
    constructor() {
        super(notificationModel_1.default);
    }
    // async getAllNotifications(filter: Filter): Promise<INotification[] | null>{
    //     return await Notification.find({ ...filter }).sort({ createdAt: -1 }).exec();
    // }
    getAllNotifications(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield notificationModel_1.default.find(Object.assign({}, filter)).sort({ createdAt: -1 }).exec();
            const readCount = yield notificationModel_1.default.countDocuments(Object.assign(Object.assign({}, filter), { isRead: false }));
            return { notifications, readCount };
        });
    }
}
exports.default = NotificationRepository;
