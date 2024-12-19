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
        const chats = await Chatroom.aggregate([
          // Match chatrooms based on the provided filter
          { $match: { ...filter } },
          // Lookup to populate customerId with specific fields
          { 
            $lookup: { 
              from: 'customers', // Collection name for customers
              localField: 'customerId', 
              foreignField: '_id', 
              as: 'customerData' 
            }
          },
          { 
            $unwind: { 
              path: '$customerData', 
              preserveNullAndEmptyArrays: true 
            }
          },
          // Add unread message count for Customer senderType
          { 
            $addFields: { 
              unreadMessages: { 
                $size: { 
                  $filter: { 
                    input: '$messages', // Access messages array
                    as: 'message', 
                    cond: { 
                      $and: [
                        { $eq: ['$$message.senderType', 'customer'] }, // Check senderType is 'Customer'
                        { $eq: ['$$message.isRead', false] } // Check isRead is false
                      ]
                    } 
                  } 
                } 
              } 
            }
          },
          // Project the required fields
          { 
            $project: { 
              _id: 1, // Include chatroom _id
              customerId: {
                _id: '$customerData._id',
                firstName: '$customerData.firstName',
                lastName: '$customerData.lastName',
                email: '$customerData.email',
              },
              unreadMessages: 1 // Include unreadMessages count
            }
          },
          { 
            $sort: { updatedAt: -1 } 
          }
        ]);
      
        return chats;
          
      // return await Chatroom.find({ ...filter })
      //   .select('_id customerId')  // Select only _id and customerId fields
      //   .populate('customerId')
      //   .sort({ updatedAt: -1 })
      //   .exec();
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

    async markMessagesRead(messageIds: string[], chatroomId: string){
      return await Chatroom.updateOne(
        { _id: chatroomId }, // Match the chatroom
        {
          $set: { 'messages.$[msg].isRead': true }, // Update isRead for matching messages
        },
        {
          arrayFilters: [{ 'msg._id': { $in: messageIds } }], // Apply only to messages in messageIds
        }
      )
    }
  }
    


export  default ChatroomRepository;