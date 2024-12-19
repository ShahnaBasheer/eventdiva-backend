
// src/services/VideoCallService.ts

import { BadRequestError, NotFoundError } from "../errors/customError";
import ChatroomRepository from "../repositories/chatRoom.repository";
import { IChatroomDocument, IMessage } from "../interfaces/chatRoom.interface";
import mongoose from 'mongoose';
import CustomerRepository from "../repositories/customer.repository";
import VendorRepository from "../repositories/vendor.repository";
import { UserRole, VCDocType } from '../utils/important-variables';
import Chatroom from "../models/chatRoomModel";



class ChatRoomService {
    constructor(
        private _chatroomrepository: ChatroomRepository,
        private _customerepository: CustomerRepository,
        private _vendorepository: VendorRepository,
    ) {}

   async createRoomOrFind(user: VCDocType, receiverId: string): Promise<IChatroomDocument> {
        try {
            let customerId = '';
            let vendorId = '';
            if(user?.role === UserRole.Customer){
                customerId = user.id;
                let vendor = await this._vendorepository.getById(receiverId);
                if(vendor){
                    vendorId = vendor.id;
                } else {
                    throw new BadRequestError('Vendor is not exist')
                }
            } else if(user?.role === UserRole.Vendor){
                vendorId = user.id;
                let customer = await this._customerepository.getById(receiverId);
                if(customer){
                    customerId = customer.id;
                } else {
                    throw new BadRequestError('Customer is not exist')
                }
            }
            let existRoom = await this._chatroomrepository.findChatroom({ customerId, vendorId });
            if(!existRoom){
                existRoom = await this._chatroomrepository.createChatRoom({ customerId, vendorId})
            }
            return existRoom;

        } catch (error: any) {
            console.log(error.message, "chat room start")
            throw new BadRequestError('Unable to join chat room')
        }   
    }

    async addNewMessage(senderId: string, message: string, userRole: string, roomId: string){
        try {
            let role: UserRole = UserRole.Customer;
            if(userRole.toLowerCase() === UserRole.Vendor){
                role = UserRole.Vendor;
            }

            const newMessage: IMessage = {
                senderId: new mongoose.Types.ObjectId(senderId), 
                senderType: role,
                content: message,
                isRead: false
            }
            return await this._chatroomrepository.update({_id: roomId},{ $push: { messages: newMessage } })
            
        } catch (error: any) {
            console.log(error.message, "chat room add new message")
            throw new BadRequestError('Unable to save message')
        }
    }

    async getAllChats(vendorId: string){
        try {
            return await this._chatroomrepository.getAllChats({ vendorId: new mongoose.Types.ObjectId(vendorId) })
        } catch(error: any){
            console.log("error in fetching", error?.message);
            throw new BadRequestError('Error in Fetching Allchats');
        }
        
    }

    async getAllUreadMessage(vendorId: string): Promise<number>{
        const unreadMessages = await this._chatroomrepository.getAllUnreadMessages(vendorId);
        return unreadMessages;
    }

    async markMessagesAsRead(messageIds: string[], roomId: string){
        const result = await this._chatroomrepository.markMessagesRead(messageIds, roomId)
    
        if (result?.modifiedCount < 0) {
            throw new NotFoundError(`No matching message found to update in chatroom ${roomId}.`);
        }
        return result;
    }
}


export  default ChatRoomService;