import { Request } from 'express';
import { Socket } from 'socket.io';
import { IUserDocument } from '../utils/important-variables';


interface CustomRequest extends Request {
    user?: any;
    token?: string;
    tokenType?: string;
}



interface CustomSocket extends  Socket{
    roomId?: string;
    customerId?: string;
    vendorId?: string;
    user?: IUserDocument;
    userId?: string; 
}

export {
    CustomRequest,
    CustomSocket
}