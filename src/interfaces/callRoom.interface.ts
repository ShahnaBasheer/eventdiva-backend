// src/models/CallRoom.ts
import mongoose, { Schema, Document } from 'mongoose';

interface ICallRoom {
    callRoomId: string;
    userId: string;
    vendord: string;
    participants: string[];
}


interface ICallRoomDocument extends ICallRoom, Document {}


export {
    ICallRoom,
    ICallRoomDocument
}