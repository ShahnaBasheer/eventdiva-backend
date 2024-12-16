import jwt, { JwtPayload } from 'jsonwebtoken';
import { IAdminDocument } from '../interfaces/admin.interface';
import { IVendor, IVendorDocument } from '../interfaces/vendor.interface';
import { generateAdminToken, generateCustomerToken, generateRefreshAdminToken, generateRefreshCustomerToken, generateRefreshVendorToken, generateVendorToken } from '../config/jwToken';
import { NotificationType } from './eventsVariables';
import { INotification } from '../interfaces/notification.interface';
import { IUserDocument, UserRole } from './important-variables';
import UserService from '../services/user.service';
import VendorRepository from '../repositories/vendor.repository';
import AdminRepository from '../repositories/admin.repository';
import CustomerRepository from '../repositories/customer.repository';
import NotificationRepository from '../repositories/notification.repository';
import { ICustomerDocument } from '../interfaces/customer.interface';
import { notificationService } from '../config/dependencyContainer';
import { Status } from './status-options';



const verifyToken = async(token: string, role: UserRole, tokenType: number): Promise<IUserDocument | null> =>{
    let secretKey;

    switch (role) {
        case UserRole.Customer:
            secretKey = (tokenType === 1)? process.env.JWT_CUSTOMER_SECRET : process.env.JWT_REFRESH_CUSTOMER_SECRET;
            break;
        case UserRole.Admin:
            secretKey = (tokenType === 1)? process.env.JWT_ADMIN_SECRET: process.env.JWT_REFRESH_ADMIN_SECRET;
            break;
        case UserRole.Vendor:
            secretKey = (tokenType === 1)? process.env.JWT_VENDOR_SECRET: process.env.JWT_REFRESH_VENDOR_SECRET;;         
    }
    if (!secretKey) {
        throw new Error(`JWT secret is not defined for role: ${role}`);
    }
    const decoded = jwt.verify(token, secretKey)as JwtPayload; 

    if (!decoded.id) {
        throw new Error(`Invalid token: no ID found`);
    } 
    const service = new UserService(
      new VendorRepository(),
      new AdminRepository(),
      new CustomerRepository(),
      new NotificationRepository()
    ) 
   
    return await service.getUserById(decoded?.id, role);
}


const isVendorDocument = (user: IVendorDocument | ICustomerDocument | IAdminDocument): user is IVendorDocument => {
  return user && typeof (user  as IVendorDocument).vendorType !== undefined;
}


const generateNewToken = (id: string, role: string): string => {
    let newToken: string = '';
    if(role === UserRole.Admin){
       newToken = generateAdminToken(id, role); 
    } else if(role === UserRole.Customer){
       newToken = generateCustomerToken(id, role);
    } else if(role === UserRole.Vendor){
       newToken = generateVendorToken(id, role);
    }
    return newToken;
}



const createToken = (userId: string, role: string) => {
  let accessToken, refreshToken;
  if(role === 'admin') {
    accessToken = generateAdminToken(userId, role);
    refreshToken = generateRefreshAdminToken(userId, role);
  } else if(role === 'customer'){
    accessToken = generateCustomerToken(userId, role);
    refreshToken = generateRefreshCustomerToken(userId, role);
  } else if(role === 'vendor'){
    accessToken = generateVendorToken(userId, role);
    refreshToken = generateRefreshVendorToken(userId, role);
  }
  return { accessToken, refreshToken }
}


const generateOrderId = (vendor: string) => {
    const prefix = 'BK' + vendor; // Order ID prefix
    const uniqueNumber = Math.floor(Math.random() * 10000); // Generate a random number
    const timestamp = Date.now(); // Get current timestamp
    const orderId = `${prefix}-${uniqueNumber}-${timestamp}`; // Combine prefix, random number, and timestamp
    return orderId;
  };


const notificationTypes = {
    new_message: (name: string, message: string) => ({
      message: `New message from <b>${name}</b>: ${message.slice(0, 14)}..`,
      link: `/messages`
    }),
  
    booking_created: (bookingId: string) => ({
      message: `Your booking #${bookingId} has been successfully created`,
      link: `/bookings/${bookingId}`
    }),
  
    booking_confirmation: (bookingId: string) => ({
      message: `Booking #${bookingId} has been confirmed`,
      link: `/bookings/${bookingId}`
    }),
  
    booking_cancellation: (bookingId: string) => ({
      message: `Booking #${bookingId} has been cancelled`,
      link: `/bookings/${bookingId}/cancellation`
    }),
  
    advance_payment_customer: (amount: number, name: string) => ({
      message: `Generated Advance payment of $${amount} by ${name}`,
      link: `/payments/advance`
    }),
  
    advance_payment_vendor: (amount: number) => ({
      message: `Generated Advance payment for BookingId ${amount}`,
      link: `/payments/advance`
    }),
  
    full_payment: (summary: any) => ({
      message: `Generated Full Payment summary: ${summary}`,
      link: `/payments/full`
    }),
  
    missed_call: (name: string) => ({
      message: `You got a missed call from <b>${name}</b>`,
      link: `/calls/missed`
    }),
  
    rejected_call: (name: string) => ({
      message: `${name} has rejected your call. Try again later!`,
      link: `/calls/rejected`
    }),
  
    signup: () => ({
      message: `Welcome! Your signup is successfull`,
    }),

    service_register: () => ({
       message: `Your service has been successfully registered`,
    })
  };


  const handleNotification = async (data: any) => {
      let notificationData: { message: string, link?: string };


      switch (data.type) {
        case NotificationType.MESSAGE:
          notificationData = notificationTypes.new_message(data.name, data.message);
          break;
        
        case NotificationType.BOOKING_PLACED:
          notificationData = notificationTypes.booking_created(data.bookingId);
          break;
        
        case NotificationType.MISSED_CALL:
          notificationData = notificationTypes.missed_call(data.name);
          break;
        
        case NotificationType.BOOKING_CONFIRMATION:
          notificationData = notificationTypes.booking_confirmation(data.bookingId);
          break;

        case NotificationType.BOOKING_CANCELLATION:
          notificationData = notificationTypes.booking_cancellation(data.bookingId);
          break;
  
        case NotificationType.ADVANCE_PAYMENT:
          notificationData = notificationTypes.advance_payment_customer(data.amount, data.name);
          break;
  
        case NotificationType.FULL_PAYMENT:
          notificationData = notificationTypes.full_payment(data.summary);
          break;
  
        case NotificationType.SIGNUP:
          notificationData = notificationTypes.signup();
          break;

        case NotificationType.SERVICE_REGISTERED: 
          notificationData = notificationTypes.service_register();
          break;
  
        default:
          console.log('Unknown notification type:', data.type);
          return;
      }

      const notification: INotification | null = await notificationService.addNotification({
          userId: data.userId, 
          message: notificationData.message, 
          link: notificationData.link,
          userType: data.role, 
          notificationType: data.type 
        });
      
      return notification;

  };


  const parseQueryToStringArray = (param: unknown): string[] => {
    if (!param) return [];
    if (Array.isArray(param)) return param.map(String); // Convert each item to string
    return [String(param)];
  };

  const capitalize = (string: string) => {
    if (!string) return ''; // Handle empty or null strings
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const getRefreshKey = (role: string) => {
    if(role === UserRole.Admin) return process.env.ADMIN_REFRESH;
    else if(role === UserRole.Customer) return process.env.CUSTOMER_REFRESH;
    else if(role === UserRole.Vendor) return process.env.VENDOR_REFRESH;
    return '';
  }

  const generateServiceFilter = (user: IUserDocument, slug?: string) => {
    const filter: { vendorId?: string; slug?: string; approval?: Status } = {};
  
    switch (user.role) {
      case UserRole.Vendor:
        filter.vendorId = user.id;
        break;
  
      case UserRole.Admin:
        if (!slug) throw new Error("Slug is required for admin requests");
        filter.slug = slug;
        break;
  
      case UserRole.Customer:
        if (!slug) throw new Error("Slug is required for customer requests");
        filter.slug = slug;
        filter.approval = Status.Approved;
        break;
  
      default:
        throw new Error("Invalid user role");
    }
  
    return filter;
  }
  

export {
    generateNewToken,
    verifyToken,
    generateOrderId,
    handleNotification,
    isVendorDocument,
    parseQueryToStringArray,
    createToken,
    capitalize,
    getRefreshKey,
    generateServiceFilter
}