import { IAdminData, IAdminDocument } from "../interfaces/admin.interface";
import { ICustomerData, ICustomerDocument } from "../interfaces/customer.interface";
import { IVendorData, IVendorDocument } from "../interfaces/vendor.interface";

 
  enum UserRole {
    Admin = 'admin',
    Vendor = 'vendor',
    Customer = 'customer'
  }

  enum VendorType {
    EventPlanner = 'event-planner',
    VenueVendor = 'venue-vendor',
  }



  type IUserDocument = ICustomerDocument | IAdminDocument | IVendorDocument;
  type IUser = ICustomerData | IAdminData | IVendorData;
  type VCDocType = ICustomerDocument | IVendorDocument;
  
  export {
    UserRole,
    VendorType,
    IUserDocument,
    IUser,
    VCDocType,
  }