import { Schema, Document, Types } from "mongoose";
import { NotificationType } from "../utils/eventsVariables";



interface INotification {
    userId: Types.ObjectId;  // Reference to the 'Customer' model
    userType: 'Customer'| 'Vendor' | 'Admin';
    message: string;  // Notification message
    link?: string;   // The URL for the notification link (optional if no link)
    isRead?: boolean;  // Track if the notification has been read
    notificationType: NotificationType;  // Notification type (use enums from notificationTypes)
    createdAt?: Date;  // Automatically handled by Mongoose timestamps
    updatedAt?: Date;  // Automatically handled by Mongoose timestamps
}




interface INotificationDocument extends INotification, Document {}

export { 
    INotification, 
    INotificationDocument ,
};
