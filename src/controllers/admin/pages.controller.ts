import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../../interfaces/request.interface';
import createSuccessResponse from '../../utils/responseFormatter';
import AdminService from '../../services/admin.service';
import CustomerService from '../../services/customer.service';
import VendorService from '../../services/vendor.service';
import VenueVendorService from '../../services/venueVendor.service';
import EventPlannerService from '../../services/eventPlanner.service';



const customerService = new CustomerService();
const vendorService = new VendorService();
const venueService = new VenueVendorService();
const eventPlannerService = new EventPlannerService();


const getAdminDashBoard = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    createSuccessResponse(200, null , "successfull", res, req);
});


const getAllCustomers = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const customers = await customerService.getCustomers();
    createSuccessResponse(200, { customers } , "successfull", res, req);
});

const getAllVendors = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const vendors = await vendorService.getAllVendors();
    createSuccessResponse(200, { vendors } , "successfull", res, req);
});



const getAllVenues = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const venues = await venueService.getAllVenues({});
    createSuccessResponse(200, { venues } , "successfull", res, req);
});


const getAllPlanners = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const eventPlanners = await eventPlannerService.getAllEventPlanners({});
    createSuccessResponse(200, { eventPlanners } , "successfull", res, req);
});

const getAllVenuesBookings = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const bookings = await venueService.getAllvenueBookings({});
    createSuccessResponse(200, { bookings } , "successfull", res, req);
});


const getAllPlannersBookings = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const bookings = await eventPlannerService.getAllplannerBookings({});
    createSuccessResponse(200, { bookings } , "successfull", res, req);
});


const getVenueDetail = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    console.log(slug, "heyyyyyyy")
    const venueData = await venueService.getVenue({slug });
    createSuccessResponse(200, { venueData } , "successfully fetch venue detail", res, req)
});


const getEventPlannerDetail = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const eventPlannerData = await eventPlannerService.getEventPlanner({slug });
    createSuccessResponse(200, { eventPlannerData } , "successfully fetch event planner detail", res, req)
});

const venueStatusApproval = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug, status } = req.params;
    const venueData = await venueService.venueStatusChange(slug, status);
    createSuccessResponse(200, { venueData } , "successfully Approved venue", res, req)
});

const plannerStatusApproval = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { slug, status } = req.params;
    const plannerData = await eventPlannerService.plannerStatusChange(slug, status);
    createSuccessResponse(200, { plannerData } , "successfully Approved venue", res, req)
});


// const deleteCustomer = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     try {
//         const { id } = req.params;
//         const deletedUser = await User.findByIdAndDelete(id); 
//         const allUsers = await User.find({role: 'user'});
    
//         if (deletedUser.deletedCount === 0) {
//           return res.status(404).json({ message: 'User not found' });
//         }

//         res.status(200).json({user:req?.user, allUsers });
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//       }
// })


export {
    getAdminDashBoard,
    getAllCustomers,
    getAllVendors,
    getAllVenues,
    getAllPlanners,
    getAllVenuesBookings,
    getAllPlannersBookings,
    getVenueDetail,
    getEventPlannerDetail,
    venueStatusApproval,
    plannerStatusApproval
}