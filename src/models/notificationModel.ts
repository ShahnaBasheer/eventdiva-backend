
import { INotificationDocument } from "../interfaces/notification.interface";
import mongoose, { Schema } from "mongoose";
import { NotificationType, notificationTypes } from "../utils/eventsVariables";


const notificationSchema = new Schema<INotificationDocument>({
    userId: { 
        type: Schema.Types.ObjectId, 
        refPath: 'userType',  // Dynamically reference either 'Customer' or 'Vendor'
        required: true 
    }, 
    userType: {
        type: String,
        enum: ['Customer', 'Vendor', 'Admin'],  // Define user types
        required: true
    }, 
    message: { 
        type: String, 
        required: true
    },
    link: { 
        type: String, 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }, 
    notificationType: { 
        type: String,
        enum: NotificationType,
        required: true 
    }, 
}, { timestamps: true });

const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);

export default Notification;