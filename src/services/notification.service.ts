
import { BadRequestError, CustomError, NotFoundError } from "../errors/customError";
import mongoose from 'mongoose';
import NotificationRepository from "../repositories/notification.repository";
import { notificationTypes } from "../utils/eventsVariables";
import { INotification } from "../interfaces/notification.interface";
import VendorRepository from "../repositories/vendor.repository";
import AdminRepository from "../repositories/admin.repository";
import CustomerRepository from "../repositories/customer.repository";
import { Icustomer, IcustomerDocument } from "../interfaces/user.interface";
import { IAdmin, IAdminDocument } from "../interfaces/admin.interface";
import { IVendor, IVendorDocument } from "../interfaces/vendor.interface";



class NotificationService {

    private _notificationrepository!: NotificationRepository;
    private _vendorRepository!: VendorRepository;
    private _adminRepository!: AdminRepository;
    private _customerRepository!: CustomerRepository;
 
    constructor() {
        this._notificationrepository = new NotificationRepository();
        this._vendorRepository = new VendorRepository();
        this._adminRepository = new AdminRepository();
        this._customerRepository = new CustomerRepository();

        
    }

    Capitalize(val: string){
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }

  
    async addNotification(data: INotification): Promise<INotification | null>{
        try {
            const userIdString = data.userId.toString();
            const role = this.Capitalize(data.userType);

            let user: IcustomerDocument | IAdminDocument | IVendorDocument | null = null;

            if(role === 'Vendor'){
                user = await this._vendorRepository.getById(userIdString);
            } else if(role === 'Customer'){
                user = await this._customerRepository.getById(userIdString);
            } else if(role === 'Admin'){
                user = await this._adminRepository.getById(userIdString);
            }
           
            if(user && notificationTypes.includes(data.notificationType)){
                
                // Create a new notification
                const notification: INotification = {
                    userId: user.id,  // Assuming senderId is the user who will receive the notification
                    userType: role as 
                      ('Customer' | 'Admin' | 'Vendor'),
                    message: data.message,
                    link: data.link,
                    isRead: false,
                    notificationType: data.notificationType,
                };

                return await this._notificationrepository.create(notification, [{
                    path: 'userId',  // Populate userId
                    model: role,  //
                }]);

            }

            return null;
            
        } catch (error: any) {
            console.log(error.message, "notification add new message")
            throw new BadRequestError('Unable to save notifications')
        }
    }

    async getNotifications(userId: string, role: string): Promise<{ notifications: INotification[] | null, readCount: number }>{
        const notifications = await this._notificationrepository.getAllNotifications({ userId, userType: this.Capitalize(role) });
        return notifications;
    }
    

    async updateReadStatus(id: string): Promise<INotification | null>{
       const notification = await this._notificationrepository.update({ _id: id }, {isRead: true});
       return notification;
    }

    async deleteNotification(id: string){
        if(!id) throw new BadRequestError('Id is missing or Invalid!')
        return await this._notificationrepository.delete(id);
    }
}


export  default NotificationService;