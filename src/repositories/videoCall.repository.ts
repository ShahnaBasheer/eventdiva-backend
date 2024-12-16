

// src/repositories/VideoCallRepository.ts

import { IVideoCallRepository } from "../interfaces/videoCall.interface";
import { ICallRoomDocument } from "../interfaces/callRoom.interface";
import CallRoom from "../models/videoCallModel";
import BaseRepository from "./base.repository";


class VideoCallRepository extends BaseRepository<ICallRoomDocument> implements IVideoCallRepository{

    constructor(){
        super(CallRoom);
    }
    
    async createCallRoom(callRoomId: string, userId: string, vendorId: string): Promise<ICallRoomDocument> {
        return await CallRoom.create({ callRoomId, userId, vendorId, participants: [ userId ] });
    }

    async checkRoomExists(callRoomId: string): Promise<boolean> {
        const room = await CallRoom.findOne({ callRoomId });
        return !!room;
    }

    async addUserToCallRoom(callRoomId: string, vendorId: string): Promise<ICallRoomDocument | null> {
        return await CallRoom.findOneAndUpdate(
            { callRoomId },
            { $push: { participants: vendorId } },
            { new: true } 
        ).exec();
    }
}


export default VideoCallRepository