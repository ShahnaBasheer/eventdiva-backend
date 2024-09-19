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
exports.getJoinCall = exports.getStartCall = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const videoCall_service_1 = __importDefault(require("../../services/videoCall.service"));
const videocallservice = new videoCall_service_1.default();
const getStartCall = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.body;
    const userId = req.user.id;
    console.log(vendorId, "i am here at first");
    const callRoomId = yield videocallservice.initiateCall(userId, vendorId);
    (0, responseFormatter_1.default)(200, { roomId: callRoomId, vendorId }, "successfull", res, req);
}));
exports.getStartCall = getStartCall;
const getJoinCall = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.body;
    const vendorId = req.user.id;
    console.log(roomId, "roomId");
    const success = yield videocallservice.joinCall(vendorId, roomId);
    console.log(success, "succccess result");
    if (success) {
        (0, responseFormatter_1.default)(200, { roomId }, "successfull", res, req);
    }
}));
exports.getJoinCall = getJoinCall;