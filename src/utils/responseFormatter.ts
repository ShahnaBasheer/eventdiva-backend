import { Response } from 'express';
import { CustomRequest } from '../interfaces/request.interface';
import UserService from '../services/user.service';
import VendorRepository from '../repositories/vendor.repository';
import AdminRepository from '../repositories/admin.repository';
import CustomerRepository from '../repositories/customer.repository';
import NotificationRepository from '../repositories/notification.repository';


interface ResponseData {
    token?: string;
    user?: any;
    [key: string]: any; // Allows additional properties
}
  


const userService = new UserService(
    new VendorRepository(),
    new AdminRepository(),
    new CustomerRepository(),
    new NotificationRepository()
);


const createSuccessResponse = <T>(statusCode: number, info: T, message: string, res: Response, req?: CustomRequest): void => {
    let data: ResponseData = {};

    if(info) data = { ...info };
    if(req) {
        if(req.token) data.token = req.token;
        if(req.user){
            data.user = userService.extractUserData(req.user);
        }     
    }
    res.status(statusCode).json({ status: 'success', data , message });
}

export default createSuccessResponse;

