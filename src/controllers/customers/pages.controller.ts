
import  CustomerService  from '../../services/customer.service';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../../interfaces/request.interface';
import createSuccessResponse from '../../utils/responseFormatter';
import EventPlannerService from '../../services/eventPlanner.service';
import VenueVendorService from '../../services/venueVendor.service';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../../errors/customError';
import { Status } from '../../utils/status-options';
import NotificationService from '../../services/notification.service';




const customerService = new CustomerService();
const eventPlannerService = new EventPlannerService();
const venueVendorService = new VenueVendorService();
const notificationService = new NotificationService();


const getCustomerHome = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    createSuccessResponse(200, null , "successfull", res, req)
});


const getAllVendors = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    createSuccessResponse(200, null , "successfull", res, req)
});


const getAllEventPlanners = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const eventPlanners = await eventPlannerService.getAllEventPlanners({approval: Status.Approved});
    createSuccessResponse(200, { eventPlanners } , "successfully fetch event planners", res, req)
});


const getEventPlannerDetail = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const eventPlannerData = await eventPlannerService.getEventPlanner({slug, approval: Status.Approved});
    createSuccessResponse(200, { eventPlannerData } , "successfully fetch event planner detail", res, req)
});

const getAllVenues = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const venues = await venueVendorService.getAllVenues({approval: Status.Approved});
    createSuccessResponse(200, { venues } , "successfully fetch venues", res, req)
});


const getVenueDetail = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const venueData = await venueVendorService.getVenue({slug, approval: Status.Approved});
    createSuccessResponse(200, { venueData } , "successfully fetch venue detail", res, req)
});

const getVenueBookingPage = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const venueData = await venueVendorService.getVenue({slug, approval: Status.Approved});
    createSuccessResponse(200, { venueData } , "successfully fetch venue detail for booking", res, req)
});


const createVenueBooking = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const eventInfo = req.body?.eventInfo;
    const addressInfo = req.body?.addressInfo;   
    const servicesInfo = req.body.servicesInfo;
    const servicesRequested = req.body.servicesRequested;
    let data;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log( errors.array())
        throw new BadRequestError('Validation failed'); 
    } 
 
    if(eventInfo && addressInfo && servicesInfo  ){
        data = await venueVendorService.venueBooking({
            ...eventInfo, addressInfo, ...servicesInfo, services: servicesRequested,
            user: req.user
        }, slug )
    }   
    createSuccessResponse(200, data , "successfully fetch venue detail for booking", res, req)
});


const venueRazorPayment = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    let bookedData = await venueVendorService.razorPayment(req?.body); 
    createSuccessResponse(200, { bookedData } , "successfull", res, req);
});



const getAllBookings = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const allBookings = await customerService.getAllBookings(req.user?.id);
    createSuccessResponse(200, { allBookings } , "successfully fetch all bookings", res, req)
});

const getPlannerBookingForm = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const plannerData = await eventPlannerService.getEventPlanner({slug, approval: Status.Approved});
    createSuccessResponse(200, { plannerData } , "successfully fetch planner detail for booking", res, req)
});


const createPlannerBooking = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const eventInfo = req.body?.eventInfo;
    const addressInfo = req.body?.addressInfo;  
    const paymentInfo = req.body?.paymentInfo;  
    let data;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log( errors.array())
        throw new BadRequestError('Validation failed'); 
    } 
 
    if(eventInfo && addressInfo && paymentInfo ){
        data = await eventPlannerService.plannerBooking({
            ...eventInfo, addressInfo, ...paymentInfo , user: req.user
        }, slug )
    }   
    createSuccessResponse(200, data , "successfully fetch planner booking for booking", res, req)
});


const plannerRazorPayment = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    let bookedData = await eventPlannerService.razorPayment(req?.body); 
    createSuccessResponse(200, { bookedData } , "successfull", res, req);
});


const checkVenueAvailability = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const { eventType, isMultipleDays, startDate, endDate, startTime, endTime } = req.body;
    
    const isAvailable = await venueVendorService.checkAvailability(
        {eventType, isMultipleDays, startDate, endDate, startTime, endTime}, slug)
   
    createSuccessResponse(200, { isAvailable }  , "successfull", res, req);
});


const checkPlannerAvailability = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const { eventType, isMultipleDays, startDate, endDate, startTime, endTime } = req.body;
    
    const isAvailable = await eventPlannerService.checkAvailability(
        {eventType, isMultipleDays, startDate, endDate, startTime, endTime}, slug)
   
    createSuccessResponse(200, { isAvailable }  , "successfull", res, req);
});



const getNotifications = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const data = await notificationService.getNotifications(req.user?.id, req.user?.role);
    createSuccessResponse(200, { notifications: data.notifications, readCount: data.readCount } , "successfull", res, req)
});

const changeReadStatus = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const notification = await notificationService.updateReadStatus(req.body.id);
    createSuccessResponse(200, { notification } , "successfull", res, req)
});

const deleteNotification = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    console.log(req.params, "njjjcxnd")
    const notification = await notificationService.deleteNotification(req.params.id);
    createSuccessResponse(200, { notification } , "successfull", res, req)
});



const getPlannerBookingDetails = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const bookingData = await eventPlannerService.getOneBooking(bookingId);
    let fullPayment = 0;
    // Calculate the total sum of amounts
    if(bookingData){
       const totalServiceCharges = bookingData?.charges?.fullPayment?.servicesCharges?.reduce((sum, charge) => sum + charge.cost, 0) || 0;
       fullPayment = (bookingData?.charges?.fullPayment?.planningFee || 0) + totalServiceCharges;
    }

    console.log(fullPayment)
   
    createSuccessResponse(200, { bookingData, fullPayment } , "successfully fetch planner detail for booking", res, req)
});


const getVenueBookingDetails = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const bookingData = await venueVendorService.getOneBooking(bookingId);
    let fullPayment = 0;
    // Calculate the total sum of amounts
    if(bookingData){
       const totalServiceCharges = bookingData?.charges?.fullPayment?.servicesCharges?.reduce((sum, charge) => sum + charge.cost, 0) || 0;
       fullPayment = (bookingData?.charges?.fullPayment?.venueRental || 0) + totalServiceCharges;
    }

    console.log(fullPayment)
   
    createSuccessResponse(200, { bookingData, fullPayment } , "successfully fetch planner detail for booking", res, req)
});



const plannerAdvancePayment = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = await eventPlannerService.payAdvancepayment(bookingId);
    console.log(data, "jjhkjkj")
    createSuccessResponse(200, { ...data } , "successfully fetch planner booking for booking", res, req)
});

const plannerFullPayment = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = await eventPlannerService.payFullpayment(bookingId);
    console.log(data, "jjhkjkj")
    createSuccessResponse(200, { ...data } , "successfully fetch planner booking for booking", res, req)
});

const venueAdvancePayment = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = await venueVendorService.payAdvancepayment(bookingId);
    console.log(data, "jjhkjkj")
    createSuccessResponse(200, { ...data } , "successfully fetch planner booking for booking", res, req)
});

const venueFullPayment = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = await venueVendorService.payFullpayment(bookingId);
    console.log(data, "jjhkjkj")
    createSuccessResponse(200, { ...data } , "successfully fetch planner booking for booking", res, req)
});



export {
    getCustomerHome,
    getAllVendors,
    getAllEventPlanners,
    getEventPlannerDetail,
    getAllVenues,
    getVenueDetail,
    getVenueBookingPage,
    createVenueBooking,
    venueRazorPayment,
    getAllBookings,
    getPlannerBookingForm,
    createPlannerBooking,
    plannerRazorPayment,
    checkVenueAvailability,
    checkPlannerAvailability,
    getNotifications,
    changeReadStatus,
    deleteNotification,
    getPlannerBookingDetails,
    getVenueBookingDetails,
    plannerAdvancePayment,
    plannerFullPayment,
    venueAdvancePayment,
    venueFullPayment,

};



// import { Request, Response } from 'express';
// import { UserService } from '../services/user.service';

// export class UserController {
//   private userService = new UserService();

//   async getAllUsers(req: Request, res: Response): Promise<void> {
//     const users = await this.userService.getAllUsers();
//     res.json(users);
//   }

//   async getUserById(req: Request, res: Response): Promise<void> {
//     const id = parseInt(req.params.id, 10);
//     const user = await this.userService.getUserById(id);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).send('User not found');
//     }
//   }

//   async createUser(req: Request, res: Response): Promise<void> {
//     const user = await this.userService.createUser(req.body);
//     res.status(201).json(user);
//   }

//   async updateUser(req: Request, res: Response): Promise<void> {
//     const id = parseInt(req.params.id, 10);
//     const user = await this.userService.updateUser(id, req.body);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).send('User not found');
//     }
//   }

//   async deleteUser(req: Request, res: Response): Promise<void> {
//     const id = parseInt(req.params.id, 10);
//     const success = await this.userService.deleteUser(id);
//     if (success) {
//       res.status(204).send();
//     } else {
//       res.status(404).send('User not found');
//     }
//   }
// }
