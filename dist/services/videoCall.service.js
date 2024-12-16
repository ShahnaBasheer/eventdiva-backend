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
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = require("../errors/customError");
class VideoCallService {
    constructor(_videocallrepository) {
        this._videocallrepository = _videocallrepository;
    }
    initiateCall(userId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const callRoomId = `room_${Date.now()}`;
                yield this._videocallrepository.createCallRoom(callRoomId, userId, vendorId);
                return callRoomId;
            }
            catch (error) {
                console.log(error.message, "startcall");
                throw new customError_1.BadRequestError('Unable to start call');
            }
        });
    }
    joinCall(vendorId, callRoomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomExists = yield this._videocallrepository.checkRoomExists(callRoomId);
                if (roomExists) {
                    yield this._videocallrepository.addUserToCallRoom(callRoomId, vendorId);
                    return true;
                }
                return false;
            }
            catch (error) {
                console.log(error.message, "joincall");
                throw new customError_1.BadRequestError('Unable to join call');
            }
        });
    }
}
exports.default = VideoCallService;
