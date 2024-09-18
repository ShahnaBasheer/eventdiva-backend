

// src/models/CallRoom.ts
import { ICallRoomDocument } from 'interfaces/callRoom.interface';
import mongoose, { Schema } from 'mongoose';


const CallRoomSchema: Schema = new Schema({
    callRoomId: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    vendorId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    participants: [{ 
        type: String
     }]
}, { timestamps: true });



const CallRoom =  mongoose.model<ICallRoomDocument>('CallRoom', CallRoomSchema);

export default CallRoom;
