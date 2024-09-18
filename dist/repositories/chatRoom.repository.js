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
const chatRoomModel_1 = __importDefault(require("../models/chatRoomModel"));
const base_repository_1 = __importDefault(require("./base.repository"));
const mongoose_1 = __importDefault(require("mongoose"));
class ChatroomRepository extends base_repository_1.default {
    constructor() {
        super(chatRoomModel_1.default);
    }
    findChatroom(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRoomModel_1.default.findOne(Object.assign({}, filter)).populate('messages').exec();
        });
    }
    createChatRoom(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRoomModel_1.default.create(Object.assign({}, filter));
        });
    }
    checkRoomExists(chatRoomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatroom = yield chatRoomModel_1.default.findById(chatRoomId);
            return !!chatroom;
        });
    }
    getAllChats(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRoomModel_1.default.find(Object.assign({}, filter))
                .select('_id customerId') // Select only _id and customerId fields
                .populate('customerId')
                .sort({ updatedAt: -1 })
                .exec();
        });
    }
    getAllUnreadMessages(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unreadMessagesCount = yield chatRoomModel_1.default.aggregate([
                { $match: { vendorId: new mongoose_1.default.Types.ObjectId(vendorId) } },
                { $unwind: "$messages" },
                { $match: { "messages.isRead": false } },
                { $group: { _id: null, unreadCount: { $sum: 1 } } } // Aggregation result contains unreadCount
            ]);
            return unreadMessagesCount.length > 0 ? unreadMessagesCount[0].unreadCount : 0;
        });
    }
}
exports.default = ChatroomRepository;
