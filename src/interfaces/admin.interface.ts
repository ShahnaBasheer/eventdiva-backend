import { Document } from 'mongoose';

interface IAdmin {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface IAdminData extends IAdmin{
    password?: string;
    isDeleted?: boolean;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }


  
interface IAdminDocument extends IAdminData, Document {}

export { 
    IAdmin, 
    IAdminData,
    IAdminDocument
};
