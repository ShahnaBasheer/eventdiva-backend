import { Response } from 'express';
import { CustomRequest } from '../interfaces/request.interface';
import CustomerService from '../services/customer.service';
import AdminService from '../services/admin.service';
import VendorService from '../services/vendor.service';


interface ResponseData {
    token?: string;
    user?: any;
    [key: string]: any; // Allows additional properties
}
  

const customerService = new CustomerService();
const adminService = new AdminService();
const vendorService = new VendorService();


const createSuccessResponse = <T>(statusCode: number, info: T, message: string, res: Response, req?: CustomRequest): void => {
    let data: ResponseData = {};

    if(info) data = { ...info };
    if(req) {
        if(req.token) data.token = req.token;
        if(req.user){
            if(req.user?.role == 'customer'){
                data.user = customerService.extractUserData(req.user);
            } else if(req.user?.role == 'admin'){
                data.user = adminService.extractUserData(req.user);
            } else if(req.user?.role == 'vendor'){
                data.user = vendorService.extractUserData(req.user);
            }
        }     
    }
    res.status(statusCode).json({ status: 'success', data , message });
}

export default createSuccessResponse;

