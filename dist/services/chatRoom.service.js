"use strict";
// src/services/VideoCallService.ts
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
const customError_1 = require("../errors/customError");
const mongoose_1 = __importDefault(require("mongoose"));
const important_variables_1 = require("../utils/important-variables");
class ChatRoomService {
    constructor(_chatroomrepository, _customerepository, _vendorepository) {
        this._chatroomrepository = _chatroomrepository;
        this._customerepository = _customerepository;
        this._vendorepository = _vendorepository;
    }
    createRoomOrFind(user, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let customerId = '';
                let vendorId = '';
                if ((user === null || user === void 0 ? void 0 : user.role) === important_variables_1.UserRole.Customer) {
                    customerId = user.id;
                    let vendor = yield this._vendorepository.getById(receiverId);
                    if (vendor) {
                        vendorId = vendor.id;
                    }
                    else {
                        throw new customError_1.BadRequestError('Vendor is not exist');
                    }
                }
                else if ((user === null || user === void 0 ? void 0 : user.role) === important_variables_1.UserRole.Vendor) {
                    vendorId = user.id;
                    let customer = yield this._customerepository.getById(receiverId);
                    if (customer) {
                        customerId = customer.id;
                    }
                    else {
                        throw new customError_1.BadRequestError('Customer is not exist');
                    }
                }
                let existRoom = yield this._chatroomrepository.findChatroom({ customerId, vendorId });
                if (!existRoom) {
                    existRoom = yield this._chatroomrepository.createChatRoom({ customerId, vendorId });
                }
                return existRoom;
            }
            catch (error) {
                console.log(error.message, "chat room start");
                throw new customError_1.BadRequestError('Unable to join chat room');
            }
        });
    }
    addNewMessage(senderId, message, userRole, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let role = important_variables_1.UserRole.Customer;
                if (userRole.toLowerCase() === important_variables_1.UserRole.Vendor) {
                    role = important_variables_1.UserRole.Vendor;
                }
                const newMessage = {
                    senderId: new mongoose_1.default.Types.ObjectId(senderId),
                    senderType: role,
                    content: message,
                    isRead: false
                };
                return yield this._chatroomrepository.update({ _id: roomId }, { $push: { messages: newMessage } });
            }
            catch (error) {
                console.log(error.message, "chat room add new message");
                throw new customError_1.BadRequestError('Unable to save message');
            }
        });
    }
    getAllChats(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._chatroomrepository.getAllChats({ vendorId: new mongoose_1.default.Types.ObjectId(vendorId) });
            }
            catch (error) {
                console.log("error in fetching", error === null || error === void 0 ? void 0 : error.message);
                throw new customError_1.BadRequestError('Error in Fetching Allchats');
            }
        });
    }
    getAllUreadMessage(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unreadMessages = yield this._chatroomrepository.getAllUnreadMessages(vendorId);
            return unreadMessages;
        });
    }
    markMessagesAsRead(messageIds, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._chatroomrepository.markMessagesRead(messageIds, roomId);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) < 0) {
                throw new customError_1.NotFoundError(`No matching message found to update in chatroom ${roomId}.`);
            }
            return result;
        });
    }
}
exports.default = ChatRoomService;
