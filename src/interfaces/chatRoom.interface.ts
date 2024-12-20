

import { Schema, Document, Types } from 'mongoose';
import { UserRole } from '../utils/important-variables';


interface IChatroom {
    vendorId: Schema.Types.ObjectId;           
    customerId: Schema.Types.ObjectId;           
    messages: IMessage[];              
    createdAt?: Date;                 
    updatedAt?: Date;     
}


// Interface for a single message in the chatroom
 interface IMessage {
    senderId: Types.ObjectId;           
    senderType: UserRole;
    content: string;                    
    isRead: boolean;
    createdAt?: Date;                   
    updatedAt?: Date;                   
}


interface IChatroomDocument extends IChatroom, Document {}

export { 
    IChatroom, 
    IChatroomDocument,
    IMessage 
};


