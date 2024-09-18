

// src/services/VideoCallService.ts

import { BadRequestError } from "../errors/customError";
import VideoCallRepository from "../repositories/videoCall.repository";



class VideoCallService {

    private _videocallrepository!: VideoCallRepository;

    constructor() {
        this._videocallrepository = new VideoCallRepository();
    }
   async initiateCall(userId: string, vendorId: string): Promise<string> {
        try {
            const callRoomId = `room_${Date.now()}`;
            await this._videocallrepository.createCallRoom(callRoomId, userId, vendorId);
            return callRoomId;
        } catch (error: any) {
            console.log(error.message, "startcall")
            throw new BadRequestError('Unable to start call')
        }   
    }

    async joinCall(vendorId: string, callRoomId: string): Promise<boolean> {
        try {
            const roomExists = await this._videocallrepository.checkRoomExists(callRoomId);
            if (roomExists) {
                await this._videocallrepository.addUserToCallRoom(callRoomId, vendorId);
                return true;
            }
        return false;
        } catch (error: any) {
            console.log(error.message, "joincall")
            throw new BadRequestError('Unable to join call')
        }  
    }
}


export  default VideoCallService