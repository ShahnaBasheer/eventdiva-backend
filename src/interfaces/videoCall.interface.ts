import { ICallRoomDocument } from "./callRoom.interface";

export interface IVideoCallRepository {
  createCallRoom(callRoomId: string, userId: string, vendorId: string): Promise<ICallRoomDocument>;
  checkRoomExists(callRoomId: string): Promise<boolean>;
  addUserToCallRoom(callRoomId: string, vendorId: string): Promise<ICallRoomDocument | null>;
}
