

import { INotification, INotificationDocument } from '../interfaces/notification.interface';
import BaseRepository from './base.repository';
import Notification from '../models/notificationModel';
import { Filter } from '../interfaces/utilities.interface';



class NotificationRepository extends BaseRepository<INotificationDocument> {
    
    constructor(){
        super(Notification);
    }

    // async getAllNotifications(filter: Filter): Promise<INotification[] | null>{
    //     return await Notification.find({ ...filter }).sort({ createdAt: -1 }).exec();
    // }

    async getAllNotifications(filter: Filter): Promise<{ notifications: INotification[] | null, readCount: number }> {
        const notifications = await Notification.find({ ...filter }).sort({ createdAt: -1 }).exec();
        const readCount = await Notification.countDocuments({ ...filter, isRead: false });
        return { notifications, readCount };
    }
    
    
    

    
    
}

export default NotificationRepository;



