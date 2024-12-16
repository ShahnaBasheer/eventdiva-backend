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
const responseFormatter_1 = __importDefault(require("../utils/responseFormatter"));
const dependencyContainer_1 = require("../config/dependencyContainer");
class CommunicationController {
    constructor(videoCallService, chatRoomService) {
        this.videoCallService = videoCallService;
        this.chatRoomService = chatRoomService;
        this.getStartCall = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { vendorId } = req.body;
            const userId = req.user.id;
            const callRoomId = yield this.videoCallService.initiateCall(userId, vendorId);
            (0, responseFormatter_1.default)(200, { roomId: callRoomId, vendorId }, "successful", res, req);
        }));
        this.getJoinCall = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { roomId } = req.body;
            const vendorId = req.user.id;
            const success = yield this.videoCallService.joinCall(vendorId, roomId);
            console.log(success, "success video call result");
            if (success) {
                (0, responseFormatter_1.default)(200, { roomId }, "successful", res, req);
            }
        }));
        this.getOrCreateChatRoom = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { receiverId } = req.body;
            const roomId = yield this.chatRoomService.createRoomOrFind(req.user, receiverId);
            if (roomId) {
                (0, responseFormatter_1.default)(200, { receiverId, room: roomId }, "successful", res, req);
            }
        }));
        this.getAllChatRooms = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const allChats = yield this.chatRoomService.getAllChats((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, { allChats }, "successful", res, req);
        }));
        this.getUnreadAllMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const unread = yield this.chatRoomService.getAllUreadMessage((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, { count: unread }, "successful", res, req);
        }));
    }
}
exports.default = new CommunicationController(dependencyContainer_1.videocallservice, dependencyContainer_1.chatroomservice);
// const getStartCall = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { vendorId } = req.body;
//     const userId = req.user.id;
//     const callRoomId = await videocallservice.initiateCall(userId, vendorId);
//     createSuccessResponse(200, { roomId: callRoomId, vendorId } , "successfull", res, req)
// });
// const getJoinCall = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { roomId } = req.body;
//     const vendorId = req.user.id;
//     const success = await videocallservice.joinCall(vendorId, roomId);
//     console.log(success, "succccess video call result")
//     if(success){
//         createSuccessResponse(200, { roomId } , "successfull", res, req)
//     }
// });
// const getOrCreateChatRoom = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { receiverId } = req.body;
//     const roomId = await chatroomservice.createRoomOrFind(req.user, receiverId);
//     if(roomId){
//         createSuccessResponse(200, { receiverId, room: roomId } , "successfull", res, req)
//     }
// });
// const getAllChatRooms = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const allchats = await chatroomservice.getAllChats(req.user?.id);
//     createSuccessResponse(200, { allchats } , "successfull", res, req)
// });
// const getUnreadAllMessages = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const unread = await chatroomservice.getAllUreadMessage(req?.user?.id);
//     createSuccessResponse(200, { count: unread} , "successfull", res, req)
// });
// export {
//     getStartCall,
//     getJoinCall,
//     getOrCreateChatRoom,
//     getAllChatRooms,
//     getUnreadAllMessages
// }
