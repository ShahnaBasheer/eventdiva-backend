import { Document } from 'mongoose';

interface IAdmin {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    isDeleted?: boolean;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }


  
interface IAdminDocument extends IAdmin, Document {}

export { 
    IAdmin, 
    IAdminDocument
};
