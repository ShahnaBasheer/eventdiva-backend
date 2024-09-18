import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { Icustomer, IcustomerDocument } from './user.interface';
import { IVendor, IVendorDocument } from './vendor.interface';
import { IAdmin, IAdminDocument } from './admin.interface';


interface CustomRequest extends Request {
    user?: any;
    token?: string;
    tokenType?: string;
}



interface CustomSocket extends  Socket{
    roomId?: string;
    customerId?: string;
    vendorId?: string;
    user?: IcustomerDocument | IVendorDocument | IAdminDocument;
    userId?: string; 
}

export {
    CustomRequest,
    CustomSocket
}