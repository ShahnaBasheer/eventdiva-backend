import { Filter } from '../interfaces/utilities.interface';
import { IChatroom, IChatroomDocument } from '../interfaces/chatRoom.interface';
import Chatroom from '../models/chatRoomModel';
import BaseRepository from './base.repository';
import mongoose from 'mongoose';




class ChatroomRepository extends BaseRepository<IChatroomDocument> {

    constructor(){
        super(Chatroom);
    }

    async findChatroom(filter: Filter) {
      return await Chatroom.findOne({ ...filter }).populate('messages').exec();
    }
  
    async createChatRoom(filter: Filter) {
      return await Chatroom.create({ ...filter });
    }

    async checkRoomExists(chatRoomId: string): Promise<boolean> {
        const chatroom = await Chatroom.findById(chatRoomId);
        return !!chatroom;
    }

    async getAllChats(filter: Filter): Promise<IChatroom[] | null> {
      return await Chatroom.find({ ...filter })
        .select('_id customerId')  // Select only _id and customerId fields
        .populate('customerId')
        .sort({ updatedAt: -1 })
        .exec();
    }

    async getAllUnreadMessages(vendorId: string): Promise<number> {
      const unreadMessagesCount = await Chatroom.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
        { $unwind: "$messages" },
        { $match: { "messages.isRead": false } }, 
        { $group: { _id: null, unreadCount: { $sum: 1 } } } // Aggregation result contains unreadCount
      ]);
    
      return unreadMessagesCount.length > 0 ? unreadMessagesCount[0].unreadCount : 0;
    }
  }
    


export  default ChatroomRepository;