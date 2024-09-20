import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../../interfaces/request.interface';
import createSuccessResponse from '../../utils/responseFormatter';
import VendorService from '../../services/vendor.service';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../../errors/customError';
import VenueVendorService from '../../services/venueVendor.service';


const venueVendorService = new VenueVendorService();
const vendorService = new VendorService();
const venueService = new VenueVendorService();


const getVenueVendorDashboard = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    console.log("i am here in venue vendorr dashboard");
    const veneueVendorData = await venueVendorService.getDashboardData(req.user?.id);
    console.log(veneueVendorData);
    createSuccessResponse(200, { ...veneueVendorData } , "successfull", res, req)
});

const getVenueVendorProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const vendorDetail = await vendorService.getVendor(req?.user?.id, "venue-vendor");
    createSuccessResponse(200, { vendorDetail } , "successfull", res, req);
});

const getVenueVendorService = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const venueVendorData = await venueVendorService.getVenue({ vendorId: req.user?.id });
    createSuccessResponse(200, { venueVendorData } , "successfull", res, req);
});


const registerVenueVendorService = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const venueInfo = req.body?.venueInfo;
    const addressInfo = req.body?.addressInfo;
    const priceInfo = req.body?.priceInfo;
    const description = req.body.description;     
    const services = req.body.services;
    const amenities = req.body.amenities;
    const areas = req.body.areas;
    const files = req.files;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log( errors.array())
        throw new BadRequestError('Validation failed'); 
    } 
     
    if(venueInfo && addressInfo && description && services && amenities && priceInfo && areas){
        await venueVendorService.createVenue({
            ...venueInfo, addressInfo, ...priceInfo, description, service: services, amenities, areas,
            user: req.user
        }, files)
    }     
    createSuccessResponse(200, null , "successfull", res, req);
});


const getAllVenueBookings = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const bookings = await venueService.getAllBookings({vendorId: req.user.id});
    createSuccessResponse(200, { bookings } , "successfull", res, req);
});


const getVenueBookingDetails = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const bookingData = await venueService.getOneBooking(bookingId);
    createSuccessResponse(200, { bookingData } , "successfull", res, req);
})


const changeBookingStatus = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const { status } = req.body;
    const bookingData = await venueService.changeBookingStatus(bookingId, status, req?.user?.id);
    createSuccessResponse(200, { bookingData } , "successfull", res, req);
})

const generateAdvancePayment = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
    const { advancePayment, bookingId } = req.body?.formValue;
    const bookingData = await venueService.generateAdvancePayment(bookingId, advancePayment);
    console.log(bookingData)
    createSuccessResponse(200, { bookingData } , "successfull", res, req);
})

const getAvailabilityInfo = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
    const availabilityData = await venueService.getAvailabilityInfo(req?.user?.id);
    console.log(availabilityData)
    createSuccessResponse(200, { availabilityData } , "successfull", res, req);
})

const addHoliday = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
    const { date } = req.body;
    const holiday = await venueService.addHoliday(req.user?.id, date);
    createSuccessResponse(200, null , "Holiday added successfully", res, req);
});

const addNewEvent = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
    // const { date } = req.body;
    // const holiday = await venueService.addHoliday(req.user?.id, date);
    createSuccessResponse(200, null , "Holiday added successfully", res, req);
});

export {
    getVenueVendorDashboard,
    getVenueVendorProfile,
    getVenueVendorService,
    registerVenueVendorService,
    getAllVenueBookings,
    getVenueBookingDetails,
    changeBookingStatus,
    generateAdvancePayment,
    getAvailabilityInfo,
    addHoliday,
    addNewEvent
};




