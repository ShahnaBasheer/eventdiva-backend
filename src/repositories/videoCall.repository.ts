

// src/repositories/VideoCallRepository.ts

import { ICallRoomDocument } from "../interfaces/callRoom.interface";
import CallRoom from "../models/videoCallModel";
import BaseRepository from "./base.repository";


class VideoCallRepository extends BaseRepository<ICallRoomDocument>{

    constructor(){
        super(CallRoom);
    }
    
    async createCallRoom(callRoomId: string, userId: string, vendorId: string) {
        return CallRoom.create({ callRoomId, userId, vendorId, participants: [ userId ] });
    }

    async checkRoomExists(callRoomId: string): Promise<boolean> {
        const room = await CallRoom.findOne({ callRoomId });
        return !!room;
    }

    async addUserToCallRoom(callRoomId: string, vendorId: string) {
        return CallRoom.updateOne(
            { callRoomId },
            { $push: { participants: vendorId } }
        );
    }
}


export default VideoCallRepository