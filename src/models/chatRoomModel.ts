import { IChatroomDocument, IMessage } from '../interfaces/chatRoom.interface';
import mongoose, { Schema } from 'mongoose';



// Define the Message schema
const MessageSchema: Schema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    refPath: 'senderType',
    required: true
  },
  senderType: {
    type: String,  
    enum: ['vendor', 'customer'], 
    required: true
  },
  content: {
    type: String,
    required: true,
  }, 
  isRead: { 
    type: Boolean, 
    required: true,
    default: false 
  }, 
}, {  timestamps: true });



// Define the Chatroom schema
const ChatroomSchema: Schema = new Schema<IChatroomDocument>({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  messages: [MessageSchema], // Array of messages
  
}, { timestamps: true });

const Chatroom = mongoose.model<IChatroomDocument>('Chatroom', ChatroomSchema);

export default Chatroom;
