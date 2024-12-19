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
            const chats = yield chatRoomModel_1.default.aggregate([
                // Match chatrooms based on the provided filter
                { $match: Object.assign({}, filter) },
                // Lookup to populate customerId with specific fields
                {
                    $lookup: {
                        from: 'customers', // Collection name for customers
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customerData'
                    }
                },
                {
                    $unwind: {
                        path: '$customerData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                // Add unread message count for Customer senderType
                {
                    $addFields: {
                        unreadMessages: {
                            $size: {
                                $filter: {
                                    input: '$messages', // Access messages array
                                    as: 'message',
                                    cond: {
                                        $and: [
                                            { $eq: ['$$message.senderType', 'customer'] }, // Check senderType is 'Customer'
                                            { $eq: ['$$message.isRead', false] } // Check isRead is false
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                // Project the required fields
                {
                    $project: {
                        _id: 1, // Include chatroom _id
                        customerId: {
                            _id: '$customerData._id',
                            firstName: '$customerData.firstName',
                            lastName: '$customerData.lastName',
                            email: '$customerData.email',
                        },
                        unreadMessages: 1 // Include unreadMessages count
                    }
                },
                {
                    $sort: { updatedAt: -1 }
                }
            ]);
            return chats;
            // return await Chatroom.find({ ...filter })
            //   .select('_id customerId')  // Select only _id and customerId fields
            //   .populate('customerId')
            //   .sort({ updatedAt: -1 })
            //   .exec();
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
    markMessagesRead(messageIds, chatroomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRoomModel_1.default.updateOne({ _id: chatroomId }, // Match the chatroom
            {
                $set: { 'messages.$[msg].isRead': true }, // Update isRead for matching messages
            }, {
                arrayFilters: [{ 'msg._id': { $in: messageIds } }], // Apply only to messages in messageIds
            });
        });
    }
}
exports.default = ChatroomRepository;
