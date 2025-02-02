import asyncHandler  from 'express-async-handler';
// src/controllers/VideoCallController.ts
import { Response } from 'express';
import createSuccessResponse from '../utils/responseFormatter';
import { CustomRequest } from '../interfaces/request.interface';
import { chatroomservice, videocallservice } from '../config/dependencyContainer';
import VideoCallService from '../services/videoCall.service';
import ChatRoomService from '../services/chatRoom.service';




class CommunicationController {
    constructor(
      private videoCallService: VideoCallService,
      private chatRoomService: ChatRoomService
    ) {}
  
    getStartCall = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const { vendorId } = req.body;
        const userId = req.user.id;
        const callRoomId = await this.videoCallService.initiateCall(userId, vendorId);
        createSuccessResponse(200, { roomId: callRoomId, vendorId }, "successfull", res, req);
      }
    );
  
    getJoinCall = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const { roomId } = req.body;
        const vendorId = req.user.id;
        const success = await this.videoCallService.joinCall(vendorId, roomId);
        console.log(success, "success video call result");
        if (success) {
          createSuccessResponse(200, { roomId }, "successfull", res, req);
        }
      }
    );
  
    getOrCreateChatRoom = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const { receiverId } = req.body;
        const roomId = await this.chatRoomService.createRoomOrFind(req.user, receiverId);
        if (roomId) {
          createSuccessResponse(200, { receiverId, room: roomId }, "successfull", res, req);
        }
      }
    );
  
    getAllChatRooms = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const chats = await this.chatRoomService.getAllChats(req.user?.id);
        createSuccessResponse(200, { chats }, "successfull", res, req);
      }
    );
  
    getUnreadAllMessages = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const unread = await this.chatRoomService.getAllUreadMessage(req?.user?.id);
        createSuccessResponse(200, { count: unread }, "successfull", res, req);
      }
    );
  }
  
  export default new CommunicationController(videocallservice, chatroomservice);


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




