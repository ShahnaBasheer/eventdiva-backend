

// src/services/VideoCallService.ts

import { IcustomerDocument } from "../interfaces/user.interface";
import { BadRequestError } from "../errors/customError";
import { IVendorDocument } from "../interfaces/vendor.interface";
import ChatroomRepository from "../repositories/chatRoom.repository";
import { IChatroom, IChatroomDocument, IMessage } from "../interfaces/chatRoom.interface";
import mongoose from 'mongoose';
import CustomerRepository from "../repositories/customer.repository";
import VendorRepository from "../repositories/vendor.repository";



class ChatRoomService {

    private _chatroomrepository!: ChatroomRepository;
    private _customerepository!: CustomerRepository;
    private _vendorepository!: VendorRepository;

    constructor() {
        this._chatroomrepository = new ChatroomRepository();
        this._customerepository = new CustomerRepository();
        this._vendorepository = new VendorRepository();
    }

   async createRoomOrFind(user: IcustomerDocument | IVendorDocument, receiverId: string): Promise<IChatroomDocument> {
        try {
            let customerId = '';
            let vendorId = '';
            if(user?.role === "customer"){
                customerId = user.id;
                let vendor = await this._vendorepository.getById(receiverId);
                if(vendor){
                    vendorId = vendor.id;
                } else {
                    throw new BadRequestError('Vendor is not exist')
                }
            } else if(user?.role === 'vendor'){
                vendorId = user.id;
                console.log(receiverId)
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
            let role: 'Vendor' | 'Customer' = 'Customer';
            if(userRole.toLowerCase() === 'vendor'){
                role = 'Vendor';
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
            return await this._chatroomrepository.getAllChats({ vendorId })
        } catch(error: any){
            console.log("error in fetching", error?.message);
            throw new BadRequestError('Error in Fetching Allchats');
        }
        
    }

    async getAllUreadMessage(vendorId: string): Promise<number>{
        const unreadMessages = await this._chatroomrepository.getAllUnreadMessages(vendorId);
        return unreadMessages;
    }
}


export  default ChatRoomService